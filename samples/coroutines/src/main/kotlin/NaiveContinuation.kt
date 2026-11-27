// region cont
// A stand-in for kotlin.coroutines.Continuation. resume gives the result of the suspension point and runs the rest of the function.
fun interface Cont<in T> {
    fun resume(value: T)
}
// endregion

// region marker
// A function returns this marker if it suspends. Then its caller also returns. The real marker is COROUTINE_SUSPENDED.
object SUSPENDED
// endregion

// region loops
// main is the UI loop. io is the loop of the network requests.
val main = FakeLoop("main")
val io = FakeLoop("io")
// endregion

// region fetch
data class User(val name: String)

// The suspension point. It returns SUSPENDED at once. Later, the io loop resumes cont with the user.
// A compiled suspend function returns its result or SUSPENDED, so its return type is Any?.
fun fetchUser(id: Int, cont: Cont<User>): Any? {
    io.post { cont.resume(User("user $id")) }
    return SUSPENDED
}
// endregion

// region state-machine
// The compiler makes a state machine like this one from this suspend function:
//
//     suspend fun loadAndShow(userId: Int) {
//         val user = fetchUser(userId)
//         show(userId, user)
//     }
class LoadAndShow(private val show: (userId: Int, user: User) -> Unit) : Cont<Any?> {
    // The step that the next call of resume runs: 0 before fetchUser, 1 after fetchUser.
    var label = 0
        private set

    // Step 1 runs in a new call of resume. That call does not have the locals of step 0, so step 1 reads userId from this field.
    private var userId = 0

    // As startCoroutine does, start runs step 0 with resume(Unit).
    fun start(userId: Int) {
        this.userId = userId
        resume(Unit)
    }

    override fun resume(value: Any?) {
        var result = value
        if (label == 0) {
            label = 1
            // The flaw: no interceptor wraps this continuation. Thus the io loop runs step 1, and the UI step show runs on io.
            result = fetchUser(userId, this)
            if (result === SUSPENDED) return
        }
        show(userId, result as User)
    }
}
// endregion
