// region config
// A stand-in for Configuration, with two of its fields.
data class Configuration(val orientation: String, val uiMode: String)
// endregion

// region activity
// A stand-in for Activity. The fake thread sets `token` and `config` before it calls onCreate.
abstract class Activity {
    lateinit var token: String
    lateinit var config: Configuration
    var isDestroyed = false
        private set

    abstract fun onCreate()

    open fun onDestroy() {
        isDestroyed = true
    }
}
// endregion

// region thread
// A stand-in for ActivityThread. `newActivity` creates a new object of the Activity class.
class FakeActivityThread<A : Activity>(private var config: Configuration, private val newActivity: () -> A) {
    // One entry for each token. A relaunch puts a new object on the same token.
    private val activities = mutableMapOf<String, A>()

    fun launch(token: String): A {
        val activity = newActivity()
        activity.token = token
        activity.config = config
        activities[token] = activity
        activity.onCreate()
        return activity
    }

    fun relaunch(token: String, newConfig: Configuration): A {
        activities.getValue(token).onDestroy()
        config = newConfig
        return launch(token)
    }

    fun finish(token: String) {
        activities.getValue(token).onDestroy()
        activities.remove(token)
    }
}
// endregion
