package io.github.imgurpreetsk.afp.launchapp;

import android.app.Activity;
import android.os.Bundle;
import android.os.Process;
import android.util.Log;

// The process-death chapter reads the log of this Activity. Each line shows what survives a process death.
public class ProcessDeathActivity extends Activity {

    private static final String TAG = "ProcessDeath";
    private static final String KEY_PID = "pid";

    // Only the process that saves the state changes this field. A new process starts with 0.
    private static int staticPid;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String savedPid = savedInstanceState == null ? "none" : String.valueOf(savedInstanceState.getInt(KEY_PID));
        Log.i(TAG, "onCreate pid=" + Process.myPid() + " savedPid=" + savedPid + " staticPid=" + staticPid);
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.i(TAG, "onStop");
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(KEY_PID, Process.myPid());
        staticPid = Process.myPid();
        Log.i(TAG, "onSaveInstanceState pid=" + Process.myPid());
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy");
    }
}
