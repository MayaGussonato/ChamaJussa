import React, { useState } from "react";

import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Keyboard,
    ActivityIndicator
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { LoginStyle } from "./LoginStyle";

export const Login = ({ navigation }) => {

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [carregando, setCarregando] = useState(false);

    // =====================================================
    // FAZER LOGIN
    // =====================================================

    const fazerLogin = async () => {

        Keyboard.dismiss();

        console.log("====================================");
        console.log("TENTANDO FAZER LOGIN");
        console.log("API:", "http://172.16.1.174:5175/api");
        console.log("====================================");

        // =================================================
        // VALIDAR CAMPOS
        // =================================================

        if (!email.trim() || !senha.trim()) {

            Alert.alert(
                "Atenção",
                "Preencha o e-mail e a senha."
            );

            return;
        }

        // =================================================
        // INICIA CARREGAMENTO
        // =================================================

        setCarregando(true);

        try {

            // =================================================
            // LOGIN
            // =================================================

            const resposta = await fetch(
                "http://172.16.1.174:5175/api/Usuario/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        senha: senha
                    })
                }
            );

            console.log("STATUS DA API:", resposta.status);

            const texto = await resposta.text();

            console.log("RESPOSTA DA API:", texto);

            // =================================================
            // ERRO DA API
            // =================================================

            if (!resposta.ok) {

                let mensagem = `Erro ao fazer login. Status: ${resposta.status}`;

                try {

                    const erroJson = JSON.parse(texto);

                    if (erroJson.message) {
                        mensagem = erroJson.message;
                    }

                    if (erroJson.title) {
                        mensagem = erroJson.title;
                    }

                } catch (e) {
                    // Resposta não era JSON
                }

                Alert.alert(
                    "Erro da API",
                    mensagem
                );

                return;
            }

            // =================================================
            // CONVERTER RESPOSTA
            // =================================================

            const dados = JSON.parse(texto);

            console.log("DADOS DO LOGIN:", dados);

            // =================================================
            // PEGAR DADOS DO USUÁRIO
            // =================================================

            const token = dados.token;
            const idUsuario = dados.idUsuario;
            const nome = dados.nome;
            const emailUsuario = dados.email;

            // =================================================
            // VALIDAR TOKEN
            // =================================================

            if (!token) {

                Alert.alert(
                    "Erro",
                    "A API não retornou o token de autenticação."
                );

                return;
            }

            // =================================================
            // SALVAR TOKEN
            // =================================================

            await AsyncStorage.setItem(
                "token",
                token
            );

            // =================================================
            // SALVAR ID DO USUÁRIO
            // =================================================

            if (idUsuario) {

                await AsyncStorage.setItem(
                    "idUsuario",
                    String(idUsuario)
                );
            }

            // =================================================
            // SALVAR NOME
            // =================================================

            if (nome) {

                await AsyncStorage.setItem(
                    "nome",
                    nome
                );
            }

            // =================================================
            // SALVAR E-MAIL
            // =================================================

            if (emailUsuario) {

                await AsyncStorage.setItem(
                    "email",
                    emailUsuario
                );
            }

            console.log("====================================");
            console.log("LOGIN REALIZADO COM SUCESSO");
            console.log("Token salvo:", !!token);
            console.log("Usuário:", nome);
            console.log("ID:", idUsuario);
            console.log("E-mail:", emailUsuario);
            console.log("====================================");

            // =================================================
            // LOGIN REALIZADO
            // =================================================

            Alert.alert(
                "Sucesso",
                "Login realizado com sucesso!",
                [
                    {
                        text: "OK",

                        onPress: () => {
                            navigation.replace("ListaOS");
                        }
                    }
                ]
            );

        } catch (erro) {

            console.log("====================================");
            console.log("ERRO AO FAZER LOGIN");
            console.log("ERRO COMPLETO:", erro);
            console.log("MENSAGEM:", erro.message);
            console.log("====================================");

            Alert.alert(
                "Erro de conexão",
                "Não foi possível conectar com a API.\n\nVerifique se o computador e o celular estão na mesma rede Wi-Fi."
            );

        } finally {

            setCarregando(false);
        }
    };

    // =====================================================
    // TELA
    // =====================================================

    return (

        <KeyboardAvoidingView
            style={LoginStyle.keyboardContainer}
            behavior="padding"
            keyboardVerticalOffset={0}
        >

            <ScrollView
                style={LoginStyle.scroll}
                contentContainerStyle={
                    LoginStyle.scrollContent
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={
                    Platform.OS === "ios"
                        ? "interactive"
                        : "on-drag"
                }
            >

                <View style={LoginStyle.container}>

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <Image
                        source={require("../../../assets/logo.png")}
                        style={LoginStyle.logo}
                        resizeMode="contain"
                    />

                    {/* =================================================
                        CAIXA DE LOGIN
                    ================================================= */}

                    <View style={LoginStyle.loginBox}>

                        {/* =================================================
                            TÍTULO
                        ================================================= */}

                        <Text style={LoginStyle.title}>
                            Chama Jussa
                        </Text>

                        {/* =================================================
                            SUBTÍTULO
                        ================================================= */}

                        <Text style={LoginStyle.subtitle}>
                            Gerenciamento de Ordens de Serviço
                        </Text>

                        {/* =================================================
                            E-MAIL
                        ================================================= */}

                        <Text style={LoginStyle.label}>
                            E-mail
                        </Text>

                        <TextInput
                            style={LoginStyle.input}
                            placeholder="email@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="emailAddress"
                            value={email}
                            onChangeText={setEmail}
                            returnKeyType="next"
                            editable={!carregando}
                        />

                        {/* =================================================
                            SENHA
                        ================================================= */}

                        <Text style={LoginStyle.label}>
                            Senha
                        </Text>

                        <TextInput
                            style={LoginStyle.input}
                            placeholder="Digite sua senha"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="password"
                            value={senha}
                            onChangeText={setSenha}
                            returnKeyType="done"
                            onSubmitEditing={fazerLogin}
                            editable={!carregando}
                        />

                        {/* =================================================
                            BOTÃO
                        ================================================= */}

                        <TouchableOpacity
                            style={[
                                LoginStyle.button,

                                carregando &&
                                    LoginStyle.buttonLoading
                            ]}
                            activeOpacity={0.8}
                            onPress={fazerLogin}
                            disabled={carregando}
                        >

                            {carregando ? (

                                <View
                                    style={
                                        LoginStyle.loadingContainer
                                    }
                                >

                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />

                                    <Text
                                        style={
                                            LoginStyle.loadingText
                                        }
                                    >
                                        Entrando...
                                    </Text>

                                </View>

                            ) : (

                                <Text
                                    style={
                                        LoginStyle.buttonText
                                    }
                                >
                                    Acessar o sistema
                                </Text>

                            )}

                        </TouchableOpacity>

                    </View>

                </View>

            </ScrollView>

        </KeyboardAvoidingView>
    );
};