package io.github.imgurpreetsk.afp.launchapp;

import android.app.Activity;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlin.coroutines.CoroutineContext;
import kotlinx.coroutines.DelayKt;
import kotlinx.coroutines.Dispatchers;

// The activity of the coroutines chapter. It calls the suspend function delay from Java, with continuations that it writes by hand.
public class CoroutinesActivity extends Activity {
    static final String TAG = "Coroutines";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // The main Looper gives each line of its message log to this Printer. The Printer logs only the lines that name HandlerContext or DispatchedContinuation, the lines of the resumes.
        Looper.getMainLooper().setMessageLogging(line -> {
            if (line.contains("HandlerContext") || line.contains("DispatchedContinuation")) {
                Log.d(TAG, line);
            }
        });
        // A compiled suspend function takes a continuation as its last parameter and returns Object.
        Object result = DelayKt.delay(500L, new LogContinuation("cont", CoroutinesActivity::resumeFromWorkers));
        Log.i(TAG, "delay returned " + result);
    }

    // Resumes a second continuation from two worker threads: first directly, then through the interceptor of Dispatchers.Main.
    private static void resumeFromWorkers() {
        Continuation<Unit> cont2 = new LogContinuation("cont2", null);
        runOnWorker(() -> cont2.resumeWith(Unit.INSTANCE));
        Continuation<Unit> intercepted = Dispatchers.getMain().interceptContinuation(cont2);
        runOnWorker(() -> intercepted.resumeWith(Unit.INSTANCE));
    }

    // Runs the block on a new thread with the name worker, and waits until the thread ends.
    private static void runOnWorker(Runnable block) {
        Thread worker = new Thread(block, "worker");
        worker.start();
        try {
            worker.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // A continuation with no state machine. It logs each resume and the thread that runs it. Then, if next is not null, it runs next.
    private static final class LogContinuation implements Continuation<Unit> {
        private final String name;
        private final Runnable next;

        LogContinuation(String name, Runnable next) {
            this.name = name;
            this.next = next;
        }

        // The context holds the interceptor. On Android, Dispatchers.Main is also the Delay of the context.
        @Override
        public CoroutineContext getContext() {
            return Dispatchers.getMain();
        }

        @Override
        public void resumeWith(Object result) {
            Log.i(TAG, name + " resumeWith(" + result + ") on " + Thread.currentThread().getName());
            if (next != null) {
                next.run();
            }
        }
    }
}
