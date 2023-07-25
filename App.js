import React, { useEffect, useState } from "react";
import { theme } from "./colors";
import styled from "styled-components/native";
import { TouchableOpacity, Alert } from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  // Handling work <--> travel
  const WORKING_KEY = "@working";
  const [working, setWorking] = useState(true);
  const work = () => {
    setWorking(true);
    saveWorking(true);
  };
  const travel = () => {
    setWorking(false);
    saveWorking(false);
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
      const s = await AsyncStorage.getItem(WORKING_KEY);
      return s != null ? setWorking(JSON.parse(s)) : null;
    } catch (e) {
      // error reading value
    }
  };

  // About Text
  const [text, setText] = useState("");
  const getTextValue = (payload) => {
    setText(payload);
  };

  // About TodoItems
  const [toDos, setToDos] = useState({});
  const addToDos = async () => {
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
      const s = await AsyncStorage.getItem(TODO_KEY);
      return s != null ? setToDos(JSON.parse(s)) : null;
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getToDos();
    getWorking();
  }, []);

  // Delete ToDos
  const deleteToDos = (value) => {
    Alert.alert("해당 항목을 제거합니다", "정말로 실행하시겠습니까?", [
      {
        text: "실행",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[value];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
        style: "cancel",
      },
      { text: "취소" },
    ]);
  };

  // Handle CheckBox
  const [isChecked, setChecked] = useState(false);
  const handleCheck = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].isChecked = !newToDos[value].isChecked;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  // Editing Text value
  const [isEditing, setEditing] = useState(false);
  const [edit, setEdit] = useState("");
  const editToDos = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].isEditing = !newToDos[value].isEditing;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const getEditText = (payload) => {
    setEdit(payload);
  };
  const saveEditValue = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].text = edit;
    newToDos[value].isEditing = !newToDos[value].isEditing;
    setEdit("");
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  return (
    <MainContainer>
      <HeaderBox>
        <TouchableOpacity onPress={work}>
          <HeaderBtn style={{ color: working ? "white" : theme.grey }}>
            Work
          </HeaderBtn>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <HeaderBtn style={{ color: !working ? "white" : theme.grey }}>
            Travel
          </HeaderBtn>
        </TouchableOpacity>
      </HeaderBox>
      <InputBox
        placeholder={working ? "할 일을 적어보세요." : "어디에 가고싶죠?"}
        value={text}
        onChangeText={getTextValue}
        returnKeyType="done"
        onSubmitEditing={() => {
          addToDos();
        }}
      />
      <ListBox>
        {Object.keys(toDos).map((item) => {
          return toDos[item].working === working ? (
            <Lists key={item} opa={toDos[item].isChecked}>
              {toDos[item].isEditing === false ? (
                <ListText line={toDos[item].isChecked}>
                  {toDos[item].text}
                </ListText>
              ) : (
                <ListTextInput
                  placeholder="입력값을 변경해보세요."
                  onChangeText={getEditText}
                  value={edit}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    saveEditValue(item);
                  }}
                />
              )}
              <ListBtnBox>
                <Checkbox
                  style={{
                    marginRight: 12,
                    color: toDos[item].isChecked ? "#4630EB" : undefined,
                  }}
                  value={toDos[item].isChecked}
                  onValueChange={() => {
                    handleCheck(item);
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    editToDos(item);
                  }}
                >
                  <AntDesign name="edit" size={24} color="tomato" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ marginLeft: 12 }}
                  onPress={() => {
                    deleteToDos(item);
                  }}
                >
                  <Feather name="trash-2" size={24} color="tomato" />
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
  background-color: ${theme.bg};
  padding: 0 40px;
  font-family: "Cafe24Supermagic-Bold-v1.0";
`;

const HeaderBox = styled.View`
  margin-top: 100px;
  flex-direction: row;
  justify-content: space-between;
`;

const HeaderBtn = styled.Text`
  color: white;
  font-size: 36px;
`;

const InputBox = styled.TextInput`
  background-color: white;
  margin: 20px 0;
  padding: 10px 20px;
  border-radius: 20px;
`;

const ListBox = styled.ScrollView``;

const Lists = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${theme.grey};
  margin-bottom: 10px;
  padding: 12px 20px;
  border-radius: 20px;
  opacity: ${(props) => (props.opa ? 0.3 : 1)};
`;

const ListText = styled.Text`
  color: white;
  text-decoration: ${(props) => (props.line ? "line-through" : "none")};
`;

const ListTextInput = styled.TextInput`
  background-color: white;
  flex: 1;
  margin-right: 20px;
  padding: 4px 12px;
  border-radius: 10px;
`;

const ListBtnBox = styled.View`
  flex-direction: row;
  align-items: center;
`;
