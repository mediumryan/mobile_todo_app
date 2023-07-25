import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { theme } from "./colors";
import { TouchableOpacity, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const ITEM_KEY = "@toDos";
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

  const [isChecked, setChecked] = useState(false);

  const [text, setText] = useState("");
  const getToDos = (payload) => {
    setText(payload);
  };
  const [toDos, setToDos] = useState({});
  const submitTodos = () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, isChecked, isEditing },
    };
    setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
  };

  const saveToDos = async (value) => {
    try {
      const s = JSON.stringify(value);
      await AsyncStorage.setItem(ITEM_KEY, s);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const s = await AsyncStorage.getItem(ITEM_KEY);
      return s != null ? setToDos(JSON.parse(s)) : null;
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
    getWorking();
  }, []);

  const deleteToDos = (value) => {
    Alert.alert("해당 항목을 삭제합니다.", "정말 삭제하시겠습니까?", [
      {
        text: "네, 삭제할게요.",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[value];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
      {
        text: "아뇨, 역시 괜찮습니다.",
        style: "cancel",
      },
    ]);
  };

  const handleCheckBox = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].isChecked = !newToDos[value].isChecked;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const [isEditing, setEditing] = useState(false);

  const handleEdit = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].isEditing = !newToDos[value].isEditing;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const [edit, setEdit] = useState("");
  const getEditText = (payload) => {
    setEdit(payload);
  };
  const editTextValue = async (value) => {
    const newToDos = { ...toDos };
    newToDos[value].text = edit;
    newToDos[value].isEditing = !newToDos[value].isEditing;
    setEdit("");
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  return (
    <MainContainer>
      <HeaderContainer>
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
      </HeaderContainer>
      <InputBox
        placeholder={working ? "What will you do?" : "Where do you want to go?"}
        onChangeText={getToDos}
        value={text}
        returnKeyType="done"
        onSubmitEditing={submitTodos}
      />
      <ListBox>
        {Object.keys(toDos).map((item) => {
          return toDos[item].working === working ? (
            <Lists key={item} opa={toDos[item].isChecked}>
              {toDos[item].isEditing ? (
                <ListTextInput
                  value={edit}
                  placeholder="원하는 값으로 변경"
                  onChangeText={getEditText}
                  onSubmitEditing={() => {
                    editTextValue(item);
                  }}
                />
              ) : (
                <ListText line={toDos[item].isChecked}>
                  {toDos[item].text}
                </ListText>
              )}
              <ListBtnContainer>
                <Checkbox
                  style={{ margin: 8 }}
                  value={toDos[item].isChecked}
                  onValueChange={() => {
                    handleCheckBox(item);
                  }}
                  color={isChecked ? "white" : undefined}
                />
                <TouchableOpacity
                  onPress={() => {
                    handleEdit(item);
                  }}
                >
                  <MaterialIcons
                    name="drive-file-rename-outline"
                    size={24}
                    color="tomato"
                    style={{ marginLeft: 12 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteToDos(item);
                  }}
                >
                  <Ionicons
                    name="md-trash-outline"
                    size={24}
                    color="tomato"
                    style={{ marginLeft: 12 }}
                  />
                </TouchableOpacity>
              </ListBtnContainer>
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
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 100px;
`;

const HeaderBtn = styled.Text`
  color: white;
  font-size: 36px;
  font-weight: 700;
`;

const InputBox = styled.TextInput`
  background-color: white;
  margin: 20px 0;
  padding: 10px 0 10px 20px;
  border-radius: 30px;
  font-size: 18px;
`;

const ListBox = styled.ScrollView``;

const Lists = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${theme.grey};
  opacity: ${(props) => (props.opa ? 0.5 : 1)};
  margin-bottom: 10px;
  padding: 10px 20px;
  border-radius: 20px;
`;

const ListText = styled.Text`
  text-decoration: ${(props) => (props.line ? "line-through" : "none")};
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const ListTextInput = styled.TextInput`
  background-color: white;
  flex: 1;
  border-radius: 8px;
  font-size: 12px;
  padding: 4px 0 4px 8px;
  margin-right: 8px;
`;

const ListBtnContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;
