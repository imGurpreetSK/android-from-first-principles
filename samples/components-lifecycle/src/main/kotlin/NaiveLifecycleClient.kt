import LifecycleState.*

// region state
// The order gives each entry the number of its state in ActivityLifecycleItem: PRE_ON_CREATE is 0, ON_RESTART is 7.
enum class LifecycleState {
    PRE_ON_CREATE, ON_CREATE, ON_START, ON_RESUME, ON_PAUSE, ON_STOP, ON_DESTROY, ON_RESTART
}
// endregion

// region activity
// A stand-in for an Activity. The log shows which callbacks ran, in order.
class FakeActivity {
    val log = mutableListOf<String>()

    fun onCreate() { log += "onCreate" }
    fun onStart() { log += "onStart" }
    fun onRestart() { log += "onRestart" }
    fun onResume() { log += "onResume" }
    fun onPause() { log += "onPause" }
    fun onStop() { log += "onStop" }
    fun onDestroy() { log += "onDestroy" }
}
// endregion

// region client
// A stand-in for the app side of the lifecycle. Each request from the system names only a target state.
class NaiveLifecycleClient(private val activity: FakeActivity, start: LifecycleState = PRE_ON_CREATE) {
    var state = start
        private set

    // The flaw: the client calls only the callback of the target. It skips each state between `state` and `target`.
    fun moveTo(target: LifecycleState) {
        perform(target)
        state = target
    }

    private fun perform(step: LifecycleState) = when (step) {
        PRE_ON_CREATE -> throw IllegalArgumentException("PRE_ON_CREATE is only a start state")
        ON_CREATE -> activity.onCreate()
        ON_START -> activity.onStart()
        ON_RESUME -> activity.onResume()
        ON_PAUSE -> activity.onPause()
        ON_STOP -> activity.onStop()
        ON_DESTROY -> activity.onDestroy()
        ON_RESTART -> activity.onRestart()
    }
}
// endregion
