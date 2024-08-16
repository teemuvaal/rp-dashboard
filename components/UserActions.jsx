export default function UserActions(data) {
    return (
        <div className="flex flex-col items-center justify-center my-10">
            <h1
            className="text-2xl font-bold text-gray-900"
            >Hello, {data.user.email}! 👋</h1>
        </div>
    )
}