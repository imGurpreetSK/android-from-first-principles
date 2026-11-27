// region cold
fun interface NaiveFlow<T> {
    fun collect(collector: (T) -> Unit)
}

// The flow keeps only the block, not the values. Each collect call runs the block again with its own collector, so the flow is cold.
fun <T> naiveFlow(block: (emit: (T) -> Unit) -> Unit): NaiveFlow<T> = NaiveFlow(block)
// endregion
