import LifecycleState.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NaiveLifecycleClientTest {
    private val activity = FakeActivity()

    // region steps
    @Test
    fun naiveClient_callsCallbackOfEachTarget_whenSystemAsksForEachStep() {
        val client = NaiveLifecycleClient(activity)
        for (target in listOf(ON_CREATE, ON_START, ON_RESUME, ON_PAUSE, ON_STOP, ON_DESTROY)) client.moveTo(target)
        assertEquals(listOf("onCreate", "onStart", "onResume", "onPause", "onStop", "onDestroy"), activity.log)
        assertEquals(ON_DESTROY, client.state)
    }
    // endregion

    // region launch
    @Test
    fun naiveClient_skipsOnStart_whenLaunchIsFollowedByResume() {
        val client = NaiveLifecycleClient(activity)
        client.moveTo(ON_CREATE) // LaunchActivityItem
        client.moveTo(ON_RESUME) // ResumeActivityItem
        assertEquals(listOf("onCreate", "onResume"), activity.log)
    }
    // endregion
}
