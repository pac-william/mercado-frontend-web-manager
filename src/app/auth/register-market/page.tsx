"use client"

import { createMarketForUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, MapPin, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterMarketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        marketName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        profilePicture: "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        // Validação de senha forte
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (formData.password.length < 8) {
            toast.error("A senha deve ter no mínimo 8 caracteres");
            return;
        }
        if (!passwordRegex.test(formData.password)) {
            toast.error("A senha deve conter pelo menos: 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (@$!%*?&#)");
            return;
        }

        setLoading(true);
        try {
            const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
            const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
            const signupResponse = await fetch(`https://${auth0Domain}/dbconnections/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: auth0ClientId,
                    email: formData.email,
                    password: formData.password,
                    name: formData.userName || formData.marketName,
                    connection: 'Username-Password-Authentication',
                    user_metadata: {
                        type: 'market',
                        marketName: formData.marketName,
                    },
                }),
            });

            if (!signupResponse.ok) {
                const errorData = await signupResponse.json();
                
                if (errorData.code === 'user_exists' || errorData.message?.includes('already exists')) {
                    throw new Error('Este email já está cadastrado');
                }
                if (errorData.code === 'password_strength_error' || errorData.message?.includes('PasswordStrengthError')) {
                    throw new Error('A senha não atende aos requisitos de segurança do Auth0');
                }
                
                throw new Error(errorData.description || errorData.message || 'Erro ao criar usuário no Auth0');
            }

            const auth0User = await signupResponse.json();
            const auth0Id = auth0User._id || auth0User.user_id;

            if (!auth0Id) {
                throw new Error('Erro ao obter ID do usuário criado');
            }

            await createMarketForUser({
                auth0Id: auth0Id,
                marketName: formData.marketName,
                address: formData.address,
                profilePicture: formData.profilePicture || undefined,
                userName: formData.userName || formData.marketName,
                email: formData.email,
            });

            toast.success("Mercado cadastrado com sucesso! Você pode fazer login agora.");
            router.push("/auth/login?market=true");
        } catch (error) {
            console.error("Erro ao cadastrar mercado:", error);
            toast.error(error instanceof Error ? error.message : "Erro ao cadastrar mercado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <Store className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center">Cadastro de Mercado</CardTitle>
                    <CardDescription className="text-center">
                        Crie sua conta como administrador de mercado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="marketName">Nome do Mercado</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="marketName"
                                    type="text"
                                    placeholder="Ex: Supermercado ABC"
                                    required
                                    value={formData.marketName}
                                    onChange={(e) => setFormData({ ...formData, marketName: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="userName">Nome do Responsável (Opcional)</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="userName"
                                    type="text"
                                    placeholder="Nome do responsável pelo mercado"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contato@mercado.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Endereço</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    type="text"
                                    placeholder="Rua, número, bairro, cidade"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profilePicture">URL da Logo (Opcional)</Label>
                            <div className="relative">
                                <Image src={"https://via.placeholder.com/150"} alt="Logo" width={100} height={100} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="profilePicture"
                                    type="url"
                                    placeholder="https://exemplo.com/logo.jpg"
                                    value={formData.profilePicture}
                                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                A senha deve conter: 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (@$!%*?&#)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    required
                                    minLength={8}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                "Cadastrar Mercado"
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link href="/auth/login?market=true" className="text-primary hover:underline">
                                Fazer login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

