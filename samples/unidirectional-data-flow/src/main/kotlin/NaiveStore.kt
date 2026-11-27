// region store
// The state is private, so only the store writes it. Other code reads it through state.
class NaiveStore<S>(initial: S) {
    private var current = initial
    private val observers = mutableListOf<(S) -> Unit>()

    val state: S get() = current

    // The flaw: update reads the state and writes the next state in two separate steps.
    // If another writer changes the state between the two steps, this write replaces that change.
    fun update(transform: (S) -> S) {
        current = transform(current)
        observers.forEach { it(current) }
    }

    // The state always exists, so a new observer gets the current state at once.
    fun observe(observer: (S) -> Unit) {
        observers += observer
        observer(current)
    }
}
// endregion

// region holder
// One immutable object holds all the state of the screen.
data class CounterUiState(val count: Int)

// A stand-in for a ViewModel. The store is private, so the UI cannot write the state.
class CounterHolder {
    private val store = NaiveStore(CounterUiState(count = 0))

    // Event up: the UI calls this function. The holder makes the next state.
    fun onIncrement() = store.update { it.copy(count = it.count + 1) }

    // State down: the holder gives each new state to the render function of the UI.
    fun observe(render: (CounterUiState) -> Unit) = store.observe(render)
}
// endregion
