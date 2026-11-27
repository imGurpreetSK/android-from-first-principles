import kotlin.coroutines.Continuation
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.resume
import kotlin.coroutines.startCoroutine
import kotlin.coroutines.suspendCoroutine

// region job
class NaiveJob {
    val children = mutableListOf<NaiveJob>()
    var isCancelled = false
        private set
    var isCompleted = false
        internal set
    var failure: Throwable? = null
        internal set

    fun cancel() {
        isCancelled = true
        children.forEach { it.cancel() }
    }
}
// endregion

// region scope
class NaiveScope(val job: NaiveJob, val loop: FakeLoop) {
    fun launch(block: suspend NaiveScope.() -> Unit): NaiveJob {
        val child = NaiveJob()
        job.children += child
        block.startCoroutine(NaiveScope(child, loop), Continuation(EmptyCoroutineContext) { result ->
            // The flaw: a failure stays in the child. The parent and the other children do not get a cancellation.
            child.failure = result.exceptionOrNull()
            // The flaw: the child completes when its own block ends, also if its children still run.
            child.isCompleted = true
        })
        return child
    }
}
// endregion

// region delay
suspend fun NaiveScope.naiveDelay(ticks: Long) {
    suspendCoroutine<Unit> { continuation ->
        // The flaw: nothing watches the job. A cancellation does not resume the coroutine. The loop resumes it at its tick, also after a cancellation.
        loop.schedule(loop.now + ticks) { continuation.resume(Unit) }
    }
}
// endregion
