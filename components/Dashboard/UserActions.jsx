
export default function UserActions(userData) {
    console.log("data in component", userData)
    return (
        <div className="flex flex-col items-center justify-center my-10">
            <h1
            className="text-2xl font-bold text-gray-900"
            >Hello, {userData.user.username}! 👋</h1>
        </div>
    )
}