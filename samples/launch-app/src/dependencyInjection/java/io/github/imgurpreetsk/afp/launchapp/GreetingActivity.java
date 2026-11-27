package io.github.imgurpreetsk.afp.launchapp;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

// The only constructor takes a Greeter. The default AppComponentFactory needs a constructor with no arguments, so DiComponentFactory creates this Activity.
public class GreetingActivity extends Activity {

    private final Greeter greeter;

    // region constructor
    public GreetingActivity(Greeter greeter) {
        this.greeter = greeter;
        // The identity hash tells the Activity objects apart.
        Log.i("DI", "new GreetingActivity@" + Integer.toHexString(System.identityHashCode(this)) + " with " + greeter);
    }
    // endregion

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView text = new TextView(this);
        text.setText(greeter.greeting());
        setContentView(text);
    }
}
