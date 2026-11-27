package io.github.imgurpreetsk.afp.launchapp;

import android.app.Activity;
import android.app.AppComponentFactory;
import android.content.Intent;
import android.util.Log;

// region factory
// The manifest of the flavor names this class in android:appComponentFactory. The system creates each Activity of the app through it.
public class DiComponentFactory extends AppComponentFactory {

    @Override
    public Activity instantiateActivity(ClassLoader cl, String className, Intent intent)
            throws InstantiationException, IllegalAccessException, ClassNotFoundException {
        Log.i("DI", "instantiateActivity " + className);
        if (className.equals(GreetingActivity.class.getName())) {
            // Constructor injection: the factory gives the Activity its dependency.
            return new GreetingActivity(new Greeter());
        }
        return super.instantiateActivity(cl, className, intent);
    }
}
// endregion
