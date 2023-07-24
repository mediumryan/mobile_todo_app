import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

export default function App() {
  const ITEM_KEY = "@todos";

  const [working, setWorking] = useState(true);
  const work = () => setWorking(true);
  const travel = () => setWorking(false);

  const [todos, setTodos] = useState({});

  const [text, setText] = useState("");
  const getValue = (payload) => setText(payload);
  const handleSubmit = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...todos, [Date.now()]: { text, working } };
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };
  const saveTodos = async (value) => {
    try {
      await AsyncStorage.setItem(ITEM_KEY, JSON.stringify(value));
    } catch (e) {
      // saving error
    }
  };

  const getTodos = async () => {
    try {
      const s = await AsyncStorage.getItem(ITEM_KEY);
      return s != null ? setTodos(JSON.parse(s)) : null;
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  const deleteTodo = (key) => {
    Alert.alert("Remove this work?", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          await saveTodos(newTodos);
        },
      },
    ]);
  };

  return (
    <MainContainer>
      <StatusBar style="light" />
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
        placeholder={
          working ? "What do you want to do?" : "Where do you want to go?"
        }
        onChangeText={getValue}
        value={text}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />
      <ListBox>
        {Object.keys(todos).map((item) =>
          todos[item].working === working ? (
            <Lists key={item}>
              <ListText>{todos[item].text}</ListText>
              <TouchableOpacity
                onPress={() => {
                  deleteTodo(item);
                }}
              >
                <Ionicons name="md-trash-outline" size={24} color="yellow" />
              </TouchableOpacity>
            </Lists>
          ) : null
        )}
      </ListBox>
    </MainContainer>
  );
}

const MainContainer = styled.View`
  flex: 1;
  padding: 0 40px;
  background-color: ${theme.bg};
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
  padding: 12px 0 12px 24px;
  border-radius: 30px;
  font-size: 18px;
`;

const ListBox = styled.ScrollView``;

const Lists = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: ${theme.grey};
  border-radius: 20px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const ListText = styled.Text`
  font-size: 20px;
  color: white;
  margin-left: 12px;
`;
