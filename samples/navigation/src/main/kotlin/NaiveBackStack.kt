// region stack
// A back stack of routes. Navigate pushes a route. Back pops the top route.
class NaiveBackStack {
    private val routes = ArrayDeque<String>()

    // The map holds the state of the screen of each route, for example a scroll position. The state is a stand-in for a ViewModel or for saved UI state.
    // The flaw: the key is the route, not the entry. Two entries of one route share one state.
    private val states = mutableMapOf<String, Int?>()

    val top: String
        get() = routes.last()

    var topState: Int?
        get() = states[top]
        set(value) {
            states[top] = value
        }

    fun navigate(route: String) {
        routes.addLast(route)
    }

    fun back() {
        // The popped screen cannot come back, so the stack deletes its state.
        states.remove(routes.removeLast())
    }
}
// endregion
