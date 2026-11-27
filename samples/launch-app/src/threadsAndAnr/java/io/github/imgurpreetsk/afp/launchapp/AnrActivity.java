package io.github.imgurpreetsk.afp.launchapp;

import android.app.Activity;
import android.os.Bundle;
import android.os.HandlerThread;
import android.os.Process;
import android.view.View;
import android.widget.TextView;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// The threads-and-anr chapter lists the threads of this Activity and gets an ANR from its click handler.
public class AnrActivity extends Activity implements View.OnClickListener {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Each task starts one worker. After the tasks, the two workers wait in workQueue.take().
        ExecutorService pool = Executors.newFixedThreadPool(2);
        pool.execute(() -> { });
        pool.execute(() -> { });
        // By default, ps cuts the thread name in the CMD column to 15 characters, so the name is short.
        new HandlerThread("worker", Process.THREAD_PRIORITY_BACKGROUND).start();
        TextView text = new TextView(this);
        text.setText(R.string.app_name);
        text.setOnClickListener(this);
        setContentView(text);
    }

    @Override
    public void onClick(View view) {
        try {
            // The click handler blocks the main thread for 30 s.
            Thread.sleep(30_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
