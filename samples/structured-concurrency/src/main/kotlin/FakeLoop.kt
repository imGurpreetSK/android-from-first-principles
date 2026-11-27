// region loop
// A loop with a virtual clock. Only the test moves the clock, so no test waits.
class FakeLoop {
    var now = 0L
        private set

    // `schedule` keeps the list in order of time, so the first task is the next task to run.
    private val tasks = mutableListOf<Pair<Long, () -> Unit>>()

    fun schedule(time: Long, task: () -> Unit) {
        // The new task goes after each task with the same time, so these tasks run in schedule order.
        val index = tasks.indexOfFirst { it.first > time }
        tasks.add(if (index == -1) tasks.size else index, time to task)
    }

    fun advanceTo(time: Long) {
        while (tasks.isNotEmpty() && tasks.first().first <= time) {
            val (taskTime, task) = tasks.removeAt(0)
            now = taskTime
            task()
        }
        now = time
    }
}
// endregion
