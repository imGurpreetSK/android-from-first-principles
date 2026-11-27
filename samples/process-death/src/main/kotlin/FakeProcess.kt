// region server
// A stand-in for system_server. It keeps the saved state of each activity record outside the app process.
class FakeSystemServer {
    private val savedStates = mutableMapOf<String, Map<String, SavedState>>()

    // Each stop replaces the saved state of the record, as ActivityRecord.activityStopped does.
    fun activityStopped(record: String, savedState: Map<String, SavedState>) {
        savedStates[record] = savedState
    }

    fun savedStateOf(record: String): Map<String, SavedState>? = savedStates[record]
}
// endregion

// region process
// A stand-in for an app process with one activity. The registry of the activity is in the memory of the process.
class FakeProcess(private val server: FakeSystemServer, private val record: String) {
    private var registry: NaiveSavedStateRegistry? =
        NaiveSavedStateRegistry().apply { performRestore(server.savedStateOf(record)) }

    val savedStateRegistry: NaiveSavedStateRegistry
        get() = checkNotNull(registry) { "The process is dead" }

    // kill() gives the app no callback, so the app saves its state when the activity stops.
    fun stopActivity() = server.activityStopped(record, savedStateRegistry.performSave())

    fun kill() {
        registry = null
    }
}
// endregion
