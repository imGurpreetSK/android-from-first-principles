// region queue
// FakeQueue stands for the message queue of the thread of the collector, for example the main thread.
// The test calls runAll, so the test decides when the collector runs.
class FakeQueue {
    private val tasks = ArrayDeque<() -> Unit>()

    fun post(task: () -> Unit) {
        tasks.addLast(task)
    }

    fun runAll() {
        while (tasks.isNotEmpty()) tasks.removeFirst()()
    }
}
// endregion

// region state
// The value exists also when no code collects it, so the state flow is hot.
class NaiveStateFlow<T>(initial: T, private val queue: FakeQueue) {
    private val collectors = mutableListOf<(T) -> Unit>()

    var value: T = initial
        set(newValue) {
            field = newValue
            // The flaw: each write posts one delivery with its own copy of the value.
            // A collector that is behind gets each old value in order. It also gets a value again if the new value is equal to the old value.
            for (collector in collectors) queue.post { collector(newValue) }
        }

    // The value always exists, so a new collector gets the current value first.
    fun collect(collector: (T) -> Unit) {
        collectors += collector
        collector(value)
    }
}
// endregion
