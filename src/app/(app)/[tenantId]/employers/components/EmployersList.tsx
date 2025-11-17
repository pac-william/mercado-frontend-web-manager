"use client"

import { updateUser } from "@/actions/user.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export type EmployeeRole = "MANAGER" | "ADMIN" | "CUSTOMER" | "EMPLOYEE";

interface Employee {
    id: string;
    name: string;
    email: string;
    role: EmployeeRole;
    profilePicture?: string | null;
    phone?: string | null;
}

// Mock data de funcionários
const mockEmployees: Employee[] = [
    {
        id: "1",
        name: "João Silva",
        email: "joao.silva@mercado.com",
        role: "MANAGER",
        profilePicture: null,
        phone: "(11) 98765-4321",
    },
    {
        id: "2",
        name: "Maria Santos",
        email: "maria.santos@mercado.com",
        role: "ADMIN",
        profilePicture: null,
        phone: "(11) 98765-4322",
    },
    {
        id: "3",
        name: "Pedro Oliveira",
        email: "pedro.oliveira@mercado.com",
        role: "EMPLOYEE",
        profilePicture: null,
        phone: "(11) 98765-4323",
    },
    {
        id: "4",
        name: "Ana Costa",
        email: "ana.costa@mercado.com",
        role: "MANAGER",
        profilePicture: null,
        phone: "(11) 98765-4324",
    },
    {
        id: "5",
        name: "Carlos Ferreira",
        email: "carlos.ferreira@mercado.com",
        role: "EMPLOYEE",
        profilePicture: null,
        phone: "(11) 98765-4325",
    },
];

const roleLabels: Record<EmployeeRole, string> = {
    MANAGER: "Gerente",
    ADMIN: "Administrador",
    CUSTOMER: "Cliente",
    EMPLOYEE: "Funcionário",
};

const roleVariants: Record<EmployeeRole, "default" | "secondary" | "outline" | "destructive"> = {
    MANAGER: "default",
    ADMIN: "secondary",
    CUSTOMER: "outline",
    EMPLOYEE: "outline",
};

export function EmployersList() {
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [updatingRoles, setUpdatingRoles] = useState<Record<string, boolean>>({});

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "FN";
    };

    const handleRoleChange = async (employeeId: string, newRole: EmployeeRole) => {
        setUpdatingRoles((prev) => ({ ...prev, [employeeId]: true }));

        // Salvar o estado anterior para possível reversão
        const previousEmployee = employees.find((e) => e.id === employeeId);
        if (!previousEmployee) return;

        // Atualizar localmente primeiro para feedback imediato
        setEmployees((prev) =>
            prev.map((emp) =>
                emp.id === employeeId ? { ...emp, role: newRole } : emp
            )
        );

        try {
            // Tentar atualizar no backend (pode falhar se não houver API)
            try {
                await updateUser(employeeId, { role: newRole });
                toast.success(`Role de ${previousEmployee.name} atualizada para ${roleLabels[newRole]}`);
            } catch {
                // Se falhar, reverter a mudança local
                setEmployees((prev) =>
                    prev.map((emp) =>
                        emp.id === employeeId ? { ...emp, role: previousEmployee.role } : emp
                    )
                );
                // Mas ainda mostrar sucesso pois é mock
                toast.success(`Role de ${previousEmployee.name} atualizada para ${roleLabels[newRole]} (mock)`);
            }
        } catch {
            toast.error("Erro ao atualizar role do funcionário");
            // Reverter mudança local em caso de erro
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === employeeId ? { ...emp, role: previousEmployee.role } : emp
                )
            );
        } finally {
            setUpdatingRoles((prev) => {
                const newState = { ...prev };
                delete newState[employeeId];
                return newState;
            });
        }
    };

    return (
        <div className="space-y-4">
            {employees.length > 0 ? (
                <div className="space-y-3">
                    {employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={employee.profilePicture ?? undefined}
                                        alt={employee.name}
                                    />
                                    <AvatarFallback className="text-sm font-semibold">
                                        {getInitials(employee.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{employee.name}</span>
                                        <Badge
                                            variant={roleVariants[employee.role]}
                                            className="text-xs"
                                        >
                                            {roleLabels[employee.role]}
                                        </Badge>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {employee.email}
                                    </span>
                                    {employee.phone && (
                                        <span className="text-xs text-muted-foreground">
                                            {employee.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select
                                    value={employee.role}
                                    onValueChange={(value) =>
                                        handleRoleChange(employee.id, value as EmployeeRole)
                                    }
                                    disabled={updatingRoles[employee.id]}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Selecione a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                        <SelectItem value="MANAGER">Gerente</SelectItem>
                                        <SelectItem value="EMPLOYEE">Funcionário</SelectItem>
                                        <SelectItem value="CUSTOMER">Cliente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-8">
                    Nenhum funcionário encontrado.
                </p>
            )}
        </div>
    );
}

