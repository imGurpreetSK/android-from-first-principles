// region clock
// A fake clock and a scripted scheduler. The test moves the time, and each action runs at its time. Thus no test waits, and no thread runs.
class FakeClock {
    var now = 0L
        private set
    private val actions = mutableListOf<Pair<Long, () -> Unit>>()

    fun at(time: Long, action: () -> Unit) {
        require(time >= now) { "The time $time is before now ($now)." }
        actions += time to action
        actions.sortBy { it.first } // The sort is stable, so actions with the same time run in the order of the calls.
    }

    fun advanceTo(time: Long) {
        while (actions.isNotEmpty() && actions.first().first <= time) {
            val (actionTime, action) = actions.removeAt(0)
            now = actionTime
            action()
        }
        now = time
    }
}
// endregion

// region window
// A stand-in for a window and the main thread of its app. The main thread finishes the touches in order, at the times that the test sets.
// If a touch has no finish time, the window never finishes it, like a main thread that a long task blocks.
class FakeWindow(private val clock: FakeClock, private val finishTimes: List<Long> = emptyList()) {
    // Each touch that the window got, with the time of delivery.
    val received = mutableListOf<Pair<String, Long>>()

    // onFinish stands in for the finish signal that the app sends back to the dispatcher.
    fun receive(touch: String, onFinish: () -> Unit) {
        val finishTime = finishTimes.getOrNull(received.size)
        received += touch to clock.now
        if (finishTime != null) clock.at(finishTime, onFinish)
    }
}
// endregion

// region dispatcher
// The ANR rule of Android 10: the dispatcher starts a timer only when a touch must wait for the window.
class NaiveInputDispatcher(private val clock: FakeClock, private val window: FakeWindow) {
    // The time of each ANR that the dispatcher reports.
    val anrs = mutableListOf<Long>()

    private val inbound = ArrayDeque<String>() // The touches that the window did not get yet, oldest first.
    private val waitQueue = ArrayDeque<Long>() // The delivery time of each touch that the window did not finish, oldest first.
    private var timeoutTime: Long? = null // The one timer. It runs only while a touch waits.

    fun inject(touch: String) {
        inbound.addLast(touch)
        dispatch()
    }

    private fun dispatch() {
        while (inbound.isNotEmpty()) {
            if (!windowIsReady()) {
                waitForWindow()
                return
            }
            timeoutTime = null // The dispatcher sends this touch, so the timer of its wait stops.
            send(inbound.removeFirst())
        }
    }

    // A touch waits only if the oldest unfinished touch is 500 ms old or older.
    private fun windowIsReady() = waitQueue.isEmpty() || clock.now < waitQueue.first() + STREAM_AHEAD_EVENT_TIMEOUT

    private fun send(touch: String) {
        // The flaw: the dispatcher starts no timer for a touch that it sends.
        // If the window never finishes this touch, and no later touch must wait, the dispatcher reports no ANR.
        waitQueue.addLast(clock.now)
        window.receive(touch) {
            waitQueue.removeFirst()
            dispatch() // A touch that waits can go to the window now.
        }
    }

    private fun waitForWindow() {
        val timeout = timeoutTime
        if (timeout == null) {
            val newTimeout = clock.now + DEFAULT_INPUT_DISPATCHING_TIMEOUT
            timeoutTime = newTimeout
            clock.at(newTimeout) { dispatch() } // The dispatcher wakes when the timer runs out.
        } else if (clock.now >= timeout) {
            anrs += clock.now
            timeoutTime = Long.MAX_VALUE // The timer stops, so the dispatcher reports this wait one time.
        }
    }
}

// The names and the values are from InputDispatcher.cpp of Android 10. The rebuild gives the values in milliseconds.
private const val DEFAULT_INPUT_DISPATCHING_TIMEOUT = 5_000L
private const val STREAM_AHEAD_EVENT_TIMEOUT = 500L
// endregion
