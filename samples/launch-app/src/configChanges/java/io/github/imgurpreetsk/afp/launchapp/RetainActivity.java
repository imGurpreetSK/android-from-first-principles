package io.github.imgurpreetsk.afp.launchapp;

import android.os.Bundle;
import android.util.Log;
import androidx.activity.ComponentActivity;
import androidx.lifecycle.ViewModelProvider;

// The activity of the config-changes chapter. It has no android:configChanges, so a change of the night mode recreates it.
public class RetainActivity extends ComponentActivity {
    static final String TAG = "ConfigChanges";
    // Counts the objects of this class in the process, so that the log shows if an object is new.
    private static int created;
    private final int number = ++created;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        CounterViewModel viewModel = new ViewModelProvider(this).get(CounterViewModel.class);
        viewModel.count++;
        Log.i(TAG, "onCreate activity=#" + number + " viewModel=#" + viewModel.number + " count=" + viewModel.count);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy activity=#" + number + " isChangingConfigurations=" + isChangingConfigurations());
    }
}
