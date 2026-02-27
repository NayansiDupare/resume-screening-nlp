export default function OverlayPanel({ isSignUp, setIsSignUp }) {
  return (
    <div
      className={`absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col items-center justify-center px-12 text-center transition-transform duration-700 ease-in-out z-20 ${
        isSignUp ? "translate-x-full" : "translate-x-0"
      }`}
    >
      {isSignUp ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            Already have an account?
          </h2>
          <button
            onClick={() => setIsSignUp(false)}
            className="border border-white px-8 py-2 rounded-full hover:bg-white hover:text-indigo-700 transition"
          >
            Sign In
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">
            New Here?
          </h2>
          <button
            onClick={() => setIsSignUp(true)}
            className="border border-white px-8 py-2 rounded-full hover:bg-white hover:text-indigo-700 transition"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}