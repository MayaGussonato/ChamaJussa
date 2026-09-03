import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  SafeAreaProvider,
  SafeAreaView
} from "react-native-safe-area-context";

import { PerfilStyle } from "./PerfilStyle";
import { Footer } from "../../components/footer/Footer";
import { api } from "../../services/api";

export const Perfil = ({ navigation }) => {

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoExpandida, setFotoExpandida] = useState(false);

  // IP ATUAL DA API
  const URL_API = "http://172.16.1.174:5175";

  // =====================================================
  // BUSCAR PERFIL
  // =====================================================

  const getPerfil = async () => {

    try {

      setCarregando(true);

      const idUsuario =
        await AsyncStorage.getItem("idUsuario");

      console.log("====================================");
      console.log("ID DO USUÁRIO:", idUsuario);
      console.log("====================================");

      if (!idUsuario) {

        Alert.alert(
          "Erro",
          "Não foi possível identificar o usuário."
        );

        return;
      }

      const resposta = await api.get(
        `/Usuario/${idUsuario}`
      );

      console.log("====================================");
      console.log("DADOS DO USUÁRIO:");
      console.log(resposta.data);
      console.log("====================================");

      console.log(
        "FOTO DE PERFIL:",
        resposta.data?.fotoPerfil
      );

      setUsuario(resposta.data);

    } catch (erro) {

      console.log("====================================");
      console.log("ERRO AO BUSCAR PERFIL");
      console.log(erro);
      console.log("STATUS:", erro.response?.status);
      console.log("DADOS:", erro.response?.data);
      console.log("====================================");

      if (erro.response) {

        Alert.alert(
          "Erro",
          "Não foi possível carregar seus dados."
        );

      } else {

        Alert.alert(
          "Erro",
          "Não foi possível conectar com a API."
        );
      }

    } finally {

      setCarregando(false);
    }
  };

  // =====================================================
  // CARREGAR PERFIL
  // =====================================================

  useEffect(() => {

    getPerfil();

  }, []);

  // =====================================================
  // SAIR
  // =====================================================

  const sair = async () => {

    Alert.alert(
      "Sair",
      "Deseja realmente sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },

        {
          text: "Sair",

          onPress: async () => {

            try {

              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("idUsuario");
              await AsyncStorage.removeItem("nome");
              await AsyncStorage.removeItem("email");

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "Login"
                  }
                ]
              });

            } catch (erro) {

              console.log(
                "Erro ao sair:",
                erro
              );

            }
          }
        }
      ]
    );
  };

  // =====================================================
  // URL DA FOTO
  // =====================================================

  const getUrlFoto = () => {

    if (!usuario?.fotoPerfil) {

      console.log(
        "Usuário não possui foto de perfil."
      );

      return null;
    }

    const foto =
      String(usuario.fotoPerfil).trim();

    console.log("====================================");
    console.log("MONTANDO URL DA FOTO");
    console.log("Foto recebida:", foto);
    console.log("====================================");

    // URL COMPLETA
    if (
      foto.startsWith("http://") ||
      foto.startsWith("https://")
    ) {

      return foto;
    }

    // BASE64
    if (foto.startsWith("data:")) {

      return foto;
    }

    // CAMINHO RELATIVO
    const caminhoFormatado =
      foto.startsWith("/")
        ? foto
        : `/${foto}`;

    const urlFinal =
      `${URL_API}${caminhoFormatado}`;

    console.log(
      "URL FINAL DA FOTO:",
      urlFinal
    );

    return urlFinal;
  };

  const urlFoto = getUrlFoto();

  // =====================================================
  // TELA
  // =====================================================

  return (

    <SafeAreaProvider>

      <SafeAreaView
        style={PerfilStyle.container}
        edges={["top", "bottom"]}
      >

        {/* TÍTULO */}

        <Text style={PerfilStyle.title}>
          Perfil
        </Text>

        {/* CONTEÚDO */}

        <ScrollView
          style={PerfilStyle.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            PerfilStyle.scrollContent
          }
        >

          {carregando ? (

            <Text style={PerfilStyle.loading}>
              Carregando seus dados...
            </Text>

          ) : (

            <>

              {/* CARD DO USUÁRIO */}

              <View style={PerfilStyle.card}>

                {/* FOTO */}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {

                    if (urlFoto) {
                      setFotoExpandida(true);
                    }

                  }}
                  style={PerfilStyle.avatar}
                >

                  {urlFoto ? (

                    <Image
                      source={{
                        uri: urlFoto
                      }}
                      style={
                        PerfilStyle.avatarImage
                      }
                      resizeMode="cover"

                      onLoad={() => {

                        console.log(
                          "===================================="
                        );

                        console.log(
                          "FOTO DE PERFIL CARREGADA"
                        );

                        console.log(
                          "URL:",
                          urlFoto
                        );

                        console.log(
                          "===================================="
                        );

                      }}

                      onError={(erro) => {

                        console.log(
                          "===================================="
                        );

                        console.log(
                          "ERRO AO CARREGAR FOTO DE PERFIL"
                        );

                        console.log(
                          "URL:",
                          urlFoto
                        );

                        console.log(
                          "ERRO:",
                          erro.nativeEvent
                        );

                        console.log(
                          "===================================="
                        );

                      }}
                    />

                  ) : (

                    <Text
                      style={
                        PerfilStyle.avatarText
                      }
                    >

                      {usuario?.nome
                        ? usuario.nome
                            .charAt(0)
                            .toUpperCase()
                        : "U"
                      }

                    </Text>

                  )}

                </TouchableOpacity>

                {/* NOME */}

                <Text style={PerfilStyle.nome}>
                  {usuario?.nome || "Usuário"}
                </Text>

                {/* EMAIL */}

                <Text style={PerfilStyle.email}>
                  {usuario?.email || ""}
                </Text>

              </View>

              {/* SAIR */}

              <TouchableOpacity
                style={
                  PerfilStyle.logoutButton
                }
                activeOpacity={0.8}
                onPress={sair}
              >

                <Text
                  style={
                    PerfilStyle.logoutText
                  }
                >
                  Sair da conta
                </Text>

              </TouchableOpacity>

            </>

          )}

        </ScrollView>

        {/* =====================================================
            MODAL DA FOTO
        ===================================================== */}

        <Modal
          visible={fotoExpandida}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setFotoExpandida(false);
          }}
        >

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setFotoExpandida(false);
            }}
            style={
              PerfilStyle.modalBackground
            }
          >

            {/* BOTÃO FECHAR */}

            <TouchableOpacity
              onPress={() => {
                setFotoExpandida(false);
              }}
              activeOpacity={0.7}
              style={
                PerfilStyle.closeButton
              }
            >

              <Text
                style={
                  PerfilStyle.closeButtonText
                }
              >
                ×
              </Text>

            </TouchableOpacity>

            {/* FOTO GRANDE */}

            {urlFoto && (

              <Image
                source={{
                  uri: urlFoto
                }}
                style={
                  PerfilStyle.expandedImage
                }
                resizeMode="contain"
              />

            )}

          </TouchableOpacity>

        </Modal>

      </SafeAreaView>

      <Footer
        navigation={navigation}
      />

    </SafeAreaProvider>
  );
};