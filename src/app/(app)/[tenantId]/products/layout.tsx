
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-row flex-1 gap-6">
            <div className="flex flex-col flex-1">
                {children}
            </div>
        </div>
    )
}