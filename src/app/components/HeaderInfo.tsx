export function HeaderInfo({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    )
}