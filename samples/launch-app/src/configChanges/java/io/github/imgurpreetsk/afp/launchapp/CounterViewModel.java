package io.github.imgurpreetsk.afp.launchapp;

import android.util.Log;
import androidx.lifecycle.ViewModel;

// The ViewModel of RetainActivity.
public class CounterViewModel extends ViewModel {
    // Counts the objects of this class in the process, so that the log shows if an object is new.
    private static int created;
    final int number = ++created;
    int count;

    @Override
    protected void onCleared() {
        Log.i(RetainActivity.TAG, "onCleared viewModel=#" + number);
    }
}
