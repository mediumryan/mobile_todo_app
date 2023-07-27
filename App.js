import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { theme } from "./colors";
import { TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";

export default function App() {
  // Handle and Persist Working
  const WORKING_KEY = "@working";
  const [working, setWorking] = useState(true);
  const work = async () => {
    setWorking(true);
    await saveWorking(true);
  };
  const travel = async () => {
    setWorking(false);
    await saveWorking(false);
  };
  const saveWorking = async (value) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(value));
    } catch (e) {
      // saving error
    }
  };
  const getWorking = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(WORKING_KEY);
      return jsonValue != null ? setWorking(JSON.parse(jsonValue)) : null;
    } catch (e) {
      // error reading value
    }
  };
  // Handle input text value
  const [text, setText] = useState("");
  const getTextValue = (payload) => {
    setText(payload);
  };
  // Handle toDos
  const [toDos, setToDos] = useState({});
  const handleSubmit = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, isChecked, isEditing },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  // Persist toDos
  const TODO_KEY = "@toDos";
  const saveToDos = async (value) => {
    try {
      await AsyncStorage.setItem(TODO_KEY, JSON.stringify(value));
    } catch (e) {
      // saving error
    }
  };
  const getToDos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(TODO_KEY);
      return jsonValue != null ? setToDos(JSON.parse(jsonValue)) : null;
    } catch (e) {
      // error reading value
    }
  };
  useEffect(() => {
    getToDos();
    getWorking();
  }, []);
  // Delete toDos
  const deleteToDos = (value) => {
    Alert.alert("해당 항목을 삭제합니다.", "정말로 삭제하시겠습니까?", [
      {
        text: "네, 삭제할게요.",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[value];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
      { text: "아뇨, 관둘래요.", style: "cancel" },
    ]);
  };
  // Handle CheckBox
  const [isChecked, setChecked] = useState(false);
  const handleCheckBox = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].isChecked = !newToDos[value].isChecked;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  // Edit toDos
  const [isEditing, setEditing] = useState(false);
  const changeEditValue = () => {
    setEditing(!isEditing);
  };
  const handleEdit = async (value) => {
    changeEditValue();
    const newToDos = { ...toDos };
    newToDos[value].isEditing = isEditing;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  // Edit Text
  const [newText, setNewText] = useState("");
  const getNewText = (payload) => {
    setNewText(payload);
  };
  const submitNewText = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].text = newText;
    newToDos[value].isEditing = !newToDos[value].isEditing;
    await saveToDos(newToDos);
    setEditing(false);
    setNewText("");
  };

  return (
    <MainContainer>
      <HeaderBox
        colors={[theme.primary_100, theme.primary_200]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={work}>
          <HeaderBtn
            style={{ color: working ? theme.primary_300 : theme.accent_100 }}
          >
            Work
          </HeaderBtn>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <HeaderBtn
            style={{ color: !working ? theme.primary_300 : theme.accent_100 }}
          >
            Travel
          </HeaderBtn>
        </TouchableOpacity>
      </HeaderBox>
      <InputBox
        placeholder={
          working ? "할 일을 추가해보세요." : "어디로 떠나고 싶으신가요?"
        }
        value={text}
        onChangeText={getTextValue}
        onSubmitEditing={handleSubmit}
      />
      <ListBox>
        {Object.keys(toDos).map((key) => {
          return toDos[key].working === working ? (
            <Lists key={key} opa={toDos[key].isChecked}>
              <ListTextBox>
                <Checkbox
                  value={toDos[key].isChecked}
                  onValueChange={() => {
                    handleCheckBox(key);
                  }}
                  color={toDos[key].isChecked ? theme.primary_200 : undefined}
                />
                {toDos[key].isEditing ? (
                  <ListInput
                    placeholder="할 일을 수정해보세요."
                    value={newText}
                    onChangeText={getNewText}
                    onSubmitEditing={() => {
                      submitNewText(key);
                    }}
                  />
                ) : (
                  <ListText line={toDos[key].isChecked}>
                    {toDos[key].text}
                  </ListText>
                )}
              </ListTextBox>
              <ListBtnBox>
                <TouchableOpacity
                  onPress={() => {
                    handleEdit(key);
                  }}
                >
                  <AntDesign
                    name="edit"
                    style={{
                      color: theme.text_100,
                      fontSize: 24,
                      marginRight: 12,
                      padding: 4,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteToDos(key);
                  }}
                >
                  <FontAwesome
                    name="trash-o"
                    style={{
                      color: theme.text_100,
                      fontSize: 24,
                      padding: 4,
                    }}
                  />
                </TouchableOpacity>
              </ListBtnBox>
            </Lists>
          ) : null;
        })}
      </ListBox>
    </MainContainer>
  );
}

const MainContainer = styled.View`
  flex: 1;
  background-color: ${theme.bg_100};
  padding: 0 40px;
`;

const HeaderBox = styled(LinearGradient)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 100px;
  padding: 12px 24px;
  border-radius: 8px;
`;

const HeaderBtn = styled.Text`
  font-size: 36px;
  font-weight: 700;
`;

const InputBox = styled.TextInput`
  background-color: ${theme.bg_200};
  margin: 20px 0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 20px;
`;

const ListBox = styled.ScrollView``;

const Lists = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: ${theme.accent_100};
  opacity: ${(props) => (props.opa ? 0.5 : 1)};
`;

const ListTextBox = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  margin-right: 8px;
`;

const ListText = styled.Text`
  color: ${theme.text_100};
  font-weight: 600;
  font-size: 20px;
  margin-left: 12px;
  text-decoration: ${(props) => (props.line ? "line-through" : "none")};
`;

const ListInput = styled.TextInput`
  flex: 1;
  background-color: ${theme.bg_200};
  border-radius: 8px;
  padding: 4px 12px;
  margin-left: 8px;
`;

const ListBtnBox = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
