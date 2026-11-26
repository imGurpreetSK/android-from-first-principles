// region aidl
// A stand-in for the Java code that the AIDL compiler makes from IActivityManager.aidl.
interface IActivityManager : IInterface {
    fun attachApplication(app: IApplicationThread, startSeq: Long)

    abstract class Stub : Binder(), IActivityManager {
        override fun asBinder(): IBinder = this

        override fun onTransact(code: Int, data: Parcel): Parcel {
            check(code == TRANSACTION_attachApplication) { "Unknown code $code" }
            val app = IApplicationThread.Stub.asInterface(data.read() as IBinder)
            val startSeq = data.read() as Long
            attachApplication(app, startSeq)
            return Parcel()
        }

        class Proxy(private val remote: IBinder) : IActivityManager {
            override fun asBinder() = remote

            override fun attachApplication(app: IApplicationThread, startSeq: Long) {
                val data = Parcel()
                data.write(app.asBinder())
                data.write(startSeq)
                remote.transact(TRANSACTION_attachApplication, data)
            }
        }

        companion object {
            const val TRANSACTION_attachApplication = 1

            // Each call with a remote binder makes a new Proxy. Thus, to compare two objects, compare asBinder().
            fun asInterface(binder: IBinder): IActivityManager = binder as? IActivityManager ?: Proxy(binder)
        }
    }
}
// endregion

// A stand-in for IApplicationThread. The tests need only the identity of its binder, so it has no methods.
interface IApplicationThread : IInterface {
    abstract class Stub : Binder(), IApplicationThread {
        override fun asBinder(): IBinder = this

        override fun onTransact(code: Int, data: Parcel): Parcel = error("Unknown code $code")

        class Proxy(private val remote: IBinder) : IApplicationThread {
            override fun asBinder() = remote
        }

        companion object {
            fun asInterface(binder: IBinder): IApplicationThread = binder as? IApplicationThread ?: Proxy(binder)
        }
    }
}
