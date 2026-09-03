import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  StatusBar
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { DetalheStyle } from "./DetalheOSStyle";
import { Footer } from "../../components/footer/Footer";
import { api } from "../../services/api";

export const DetalheOS = ({ route, navigation }) => {

  const osRecebida = route.params?.os;
  const idOS = route.params?.idOS;

  const [os, setOs] = useState(osRecebida || null);
  const [carregando, setCarregando] = useState(!osRecebida);

  const [imagemExpandida, setImagemExpandida] = useState(false);

  // FOTO NOVA
  const [fotoNova, setFotoNova] = useState(null);

  // IP ATUAL DA API
  const URL_API = "http://172.16.1.174:5175";

  // =====================================================
  // FORMATAR DATA E HORA
  // =====================================================

  const formatarDataHora = (data) => {

    if (!data) {
      return "Data não informada";
    }

    const dataObj = new Date(data);

    if (isNaN(dataObj.getTime())) {
      return "Data inválida";
    }

    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const horaFormatada = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    return `${dataFormatada}, ${horaFormatada}`;
  };

  // =====================================================
  // BUSCAR OS
  // =====================================================

  const getOS = async () => {

    try {

      setCarregando(true);

      console.log("====================================");
      console.log("BUSCANDO OS:", idOS);
      console.log("====================================");

      const resposta = await api.get(
        `/OrdemServico/${idOS}`
      );

      console.log("====================================");
      console.log("OS ENCONTRADA:");
      console.log(resposta.data);
      console.log("FOTO:");
      console.log(resposta.data?.fotoProblema);
      console.log("====================================");

      setOs(resposta.data);

    } catch (erro) {

      console.log("====================================");
      console.log("ERRO AO BUSCAR OS");
      console.log(erro);
      console.log("STATUS:", erro.response?.status);
      console.log("DADOS:", erro.response?.data);
      console.log("====================================");

      if (erro.response) {

        Alert.alert(
          "Erro",
          "Não foi possível carregar os detalhes da OS."
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
  // TIRAR FOTO
  // =====================================================

  const tirarFoto = async () => {

    try {

      const permissao =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {

        Alert.alert(
          "Permissão necessária",
          "Permita o acesso à câmera para tirar uma foto."
        );

        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8
        });

      if (
        !resultado.canceled &&
        resultado.assets?.length > 0
      ) {

        const foto =
          resultado.assets[0].uri;

        console.log("====================================");
        console.log("NOVA FOTO DA OS:");
        console.log(foto);
        console.log("====================================");

        setFotoNova(foto);
      }

    } catch (erro) {

      console.log(
        "ERRO AO ABRIR CÂMERA:",
        erro
      );

      Alert.alert(
        "Erro",
        "Não foi possível abrir a câmera."
      );
    }
  };

  // =====================================================
  // ESCOLHER FOTO DA GALERIA
  // =====================================================

  const escolherFoto = async () => {

    try {

      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {

        Alert.alert(
          "Permissão necessária",
          "Permita o acesso às fotos para escolher uma imagem."
        );

        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8
        });

      if (
        !resultado.canceled &&
        resultado.assets?.length > 0
      ) {

        const foto =
          resultado.assets[0].uri;

        console.log("====================================");
        console.log("FOTO ESCOLHIDA DA GALERIA:");
        console.log(foto);
        console.log("====================================");

        setFotoNova(foto);
      }

    } catch (erro) {

      console.log(
        "ERRO AO ABRIR GALERIA:",
        erro
      );

      Alert.alert(
        "Erro",
        "Não foi possível abrir a galeria."
      );
    }
  };

  // =====================================================
  // ESCOLHER COMO ADICIONAR FOTO
  // =====================================================

  const selecionarFoto = () => {

    Alert.alert(
      "Foto do Problema",
      "Escolha uma opção:",
      [
        {
          text: "Tirar foto",
          onPress: tirarFoto
        },
        {
          text: "Escolher da galeria",
          onPress: escolherFoto
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  // =====================================================
  // EXCLUIR OS
  // =====================================================

  const excluirOS = () => {

    Alert.alert(
      "Excluir Ordem de Serviço",
      "Tem certeza que deseja excluir esta Ordem de Serviço?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },

        {
          text: "Excluir",
          style: "destructive",

          onPress: async () => {

            try {

              await api.delete(
                `/OrdemServico/${os.idOS}`
              );

              Alert.alert(
                "Sucesso",
                "Ordem de Serviço excluída com sucesso!",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      navigation.replace("ListaOS")
                  }
                ]
              );

            } catch (erro) {

              console.log(
                "Erro ao excluir OS:",
                erro
              );

              Alert.alert(
                "Erro",
                "Não foi possível excluir a Ordem de Serviço."
              );
            }
          }
        }
      ]
    );
  };

  // =====================================================
  // BUSCAR OS AO ABRIR
  // =====================================================

  useEffect(() => {

    if (!osRecebida && idOS) {
      getOS();
    }

  }, [idOS]);

  // =====================================================
  // URL DA FOTO DA API
  // =====================================================

  const getUrlFoto = () => {

    if (!os?.fotoProblema) {
      return null;
    }

    const foto =
      String(os.fotoProblema).trim();

    console.log("====================================");
    console.log("FOTO DA OS RECEBIDA:");
    console.log(foto);
    console.log("====================================");

    // URL completa
    if (
      foto.startsWith("http://") ||
      foto.startsWith("https://")
    ) {

      return foto;
    }

    // Base64
    if (foto.startsWith("data:")) {

      return foto;
    }

    // Caminho relativo
    const caminhoFormatado =
      foto.startsWith("/")
        ? foto
        : `/${foto}`;

    const urlFinal =
      `${URL_API}${caminhoFormatado}`;

    console.log("URL FINAL DA FOTO:");
    console.log(urlFinal);

    return urlFinal;
  };

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {

    return (
      <View style={DetalheStyle.container}>

        <Text style={DetalheStyle.pageTitle}>
          Carregando OS...
        </Text>

        <Footer navigation={navigation} />

      </View>
    );
  }

  // =====================================================
  // OS NÃO ENCONTRADA
  // =====================================================

  if (!os) {

    return (
      <View style={DetalheStyle.container}>

        <Text style={DetalheStyle.pageTitle}>
          OS não encontrada.
        </Text>

        <Footer navigation={navigation} />

      </View>
    );
  }

  const urlFoto = getUrlFoto();

  // FOTO QUE SERÁ MOSTRADA
  const fotoParaExibir =
    fotoNova || urlFoto;

  // =====================================================
  // TELA
  // =====================================================

  return (

    <View style={DetalheStyle.container}>

      <Text style={DetalheStyle.pageTitle}>
        Detalhes da OS-{os.numeroOS}
      </Text>

      <ScrollView
        style={DetalheStyle.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={DetalheStyle.scrollContent}
      >

        <View style={DetalheStyle.card}>

          {/* TÍTULO */}

          <Text style={DetalheStyle.osTitle}>
            {os.tituloProblema}
          </Text>

          {/* DATA */}

          <Text style={DetalheStyle.date}>
            Criada em {formatarDataHora(os.dataCadastro)}
          </Text>

          {/* MÁQUINA */}

          <View style={DetalheStyle.infoRow}>

            <Image
              source={require("../../../assets/Vector (6).png")}
              style={DetalheStyle.infoIcon}
              resizeMode="contain"
            />

            <View style={DetalheStyle.infoTextContainer}>

              <Text style={DetalheStyle.label}>
                Máquina / Equipamento
              </Text>

              <Text style={DetalheStyle.value}>
                {os.maquinaEquipamento}
              </Text>

            </View>

          </View>

          {/* LOCAL */}

          <View style={DetalheStyle.infoRow}>

            <Image
              source={require("../../../assets/Vector (7).png")}
              style={DetalheStyle.infoIcon}
              resizeMode="contain"
            />

            <View style={DetalheStyle.infoTextContainer}>

              <Text style={DetalheStyle.label}>
                Local / Setor
              </Text>

              <Text style={DetalheStyle.value}>
                {os.localSetor}
              </Text>

            </View>

          </View>

          {/* SOLICITANTE */}

          <View style={DetalheStyle.infoRow}>

            <Image
              source={require("../../../assets/Vector (8).png")}
              style={DetalheStyle.infoIcon}
              resizeMode="contain"
            />

            <View style={DetalheStyle.infoTextContainer}>

              <Text style={DetalheStyle.label}>
                Solicitante
              </Text>

              <Text style={DetalheStyle.value}>
                {os.nomeUsuario}
              </Text>

            </View>

          </View>

          {/* DIVISÓRIA */}

          <View style={DetalheStyle.divider} />

          {/* DESCRIÇÃO */}

          <Text style={DetalheStyle.sectionTitle}>
            Descrição do Problema
          </Text>

          <Text style={DetalheStyle.description}>
            {os.descricaoProblema}
          </Text>

          {/* ================================================= */}
          {/* FOTO DO PROBLEMA */}
          {/* ================================================= */}

          <Text style={DetalheStyle.sectionTitle}>
            Foto do Problema
          </Text>

          {/* BOTÃO FOTO */}

          <TouchableOpacity
            style={DetalheStyle.editButton}
            activeOpacity={0.8}
            onPress={selecionarFoto}
          >

            <Text style={DetalheStyle.editButtonText}>
              📷 {fotoParaExibir ? "Alterar foto" : "Tirar foto"}
            </Text>

          </TouchableOpacity>

          {/* FOTO */}

          {fotoParaExibir ? (

            <TouchableOpacity
              style={DetalheStyle.imageTouchable}
              activeOpacity={0.85}
              onPress={() =>
                setImagemExpandida(true)
              }
            >

              <Image
                source={{
                  uri: fotoParaExibir
                }}
                style={DetalheStyle.problemImage}
                resizeMode="cover"

                onLoad={() => {

                  console.log(
                    "FOTO DA OS CARREGADA:",
                    fotoParaExibir
                  );

                }}

                onError={(e) => {

                  console.log(
                    "ERRO AO CARREGAR FOTO DA OS:"
                  );

                  console.log(
                    "URL:",
                    fotoParaExibir
                  );

                  console.log(
                    "ERRO:",
                    e.nativeEvent
                  );

                }}
              />

              <Text style={DetalheStyle.imageHint}>
                {fotoNova
                  ? "Nova foto — toque para ampliar"
                  : "Toque na imagem para ampliar"}
              </Text>

            </TouchableOpacity>

          ) : (

            <Text style={DetalheStyle.noImage}>
              Nenhuma foto foi cadastrada.
            </Text>

          )}

          {/* ================================================= */}
          {/* BOTÕES */}
          {/* ================================================= */}

          <View style={DetalheStyle.buttonsContainer}>

            <TouchableOpacity
              style={DetalheStyle.editButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(
                  "EditarOS",
                  { os }
                )
              }
            >

              <Text style={DetalheStyle.editButtonText}>
                Editar Solicitação
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={DetalheStyle.deleteButton}
              activeOpacity={0.8}
              onPress={excluirOS}
            >

              <Text style={DetalheStyle.deleteButtonText}>
                Excluir Ordem de Serviço
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

      {/* ================================================= */}
      {/* MODAL DA IMAGEM */}
      {/* ================================================= */}

      <Modal
        visible={imagemExpandida}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setImagemExpandida(false)
        }
      >

        <View style={DetalheStyle.modalContainer}>

          <StatusBar
            backgroundColor="#000"
            barStyle="light-content"
          />

          <Pressable
            onPress={() =>
              setImagemExpandida(false)
            }
            style={DetalheStyle.closeButton}
          >

            <Text style={DetalheStyle.closeButtonText}>
              ×
            </Text>

          </Pressable>

          {fotoParaExibir && (

            <Image
              source={{
                uri: fotoParaExibir
              }}
              style={DetalheStyle.expandedImage}
              resizeMode="contain"

              onError={(e) => {

                console.log(
                  "ERRO NA FOTO EXPANDIDA:",
                  e.nativeEvent
                );

              }}
            />

          )}

        </View>

      </Modal>

      <Footer navigation={navigation} />

    </View>
  );
};