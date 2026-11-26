// region server
// A stand-in for ProcessRecord: what the server keeps for one app process.
class ProcessRecord(val thread: IApplicationThread, val startSeq: Long)

// A stand-in for ActivityManagerService in system_server.
class ActivityManager : IActivityManager.Stub() {
    val records = mutableListOf<ProcessRecord>()

    override fun attachApplication(app: IApplicationThread, startSeq: Long) {
        records += ProcessRecord(app, startSeq)
    }

    // getRecordForAppLOSP also compares binders by identity (== in Java).
    fun recordFor(app: IApplicationThread): ProcessRecord? = records.find { it.thread.asBinder() === app.asBinder() }
}
// endregion

// A stand-in for ApplicationThread: the binder object of the app.
class AppThread : IApplicationThread.Stub()
