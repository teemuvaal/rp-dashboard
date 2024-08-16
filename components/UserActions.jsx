export default function UserActions(data) {
    return (
        <div className="flex flex-col items-center justify-center my-10">
            <h1
            className="text-2xl font-bold text-gray-700"
            >Hello {data.user.email}!</h1>
            <p>Let's get started. It looks like you have no campaigns yet. Let's create one!</p>
        </div>
    )
}