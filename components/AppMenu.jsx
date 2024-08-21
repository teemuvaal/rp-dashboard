export default function AppMenu({ items }) {
    return (
        <nav className="bg-gray-900 text-white py-2 px-4 sm:px-8 overflow-x-auto">
            <ul className="flex justify-between items-center">
                {items.map((item, index) => (
                    <li key={index} className="whitespace-nowrap">
                        <a href={item.href} className="hover:bg-gray-700 px-3 sm:px-10 py-2 rounded-md text-sm sm:text-base">
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}