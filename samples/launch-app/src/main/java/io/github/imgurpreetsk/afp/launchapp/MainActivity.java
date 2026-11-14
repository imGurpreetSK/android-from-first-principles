package io.github.imgurpreetsk.afp.launchapp;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

// Section 1 follows the cold start of the launch app, from the launcher tap to the first frame of this Activity.
// After Section 1 ships, do not change this file.
public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView text = new TextView(this);
        text.setText(R.string.app_name);
        setContentView(text);
    }
}
