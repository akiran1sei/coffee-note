import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { CoffeeRecord } from "@/types/CoffeeTypes";
import { Feather } from "@expo/vector-icons"; // アイコンライブラリ

interface SearchComponentProps {
  initialData: CoffeeRecord[];
  onSearch?: (results: CoffeeRecord[]) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  initialData,
  onSearch,
}) => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<CoffeeRecord[]>([]);

  useEffect(() => {
    if (initialData) {
      setFilteredData(initialData);
    }
  }, [initialData]);

  const handleSearch = () => {
    if (!initialData) {
      return;
    }
    const lowerCaseText = searchText.toLowerCase();
    const results = initialData.filter((record) =>
      record.name.toLowerCase().includes(lowerCaseText)
    );
    setFilteredData(results);
    onSearch?.(results);
  };

  const renderItem = ({ item }: { item: CoffeeRecord }) => (
    <View style={styled.listItem}>
      <Text style={styled.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styled.container}>
      <View style={styled.inputContainer}>
        <Feather name="search" size={20} color="#777" style={styled.icon} />
        <TextInput
          style={styled.input}
          placeholder="コーヒー豆を検索..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch} // Enterキーで検索
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styled.clearButton}
          >
            <Feather name="x" size={20} color="#777" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styled.searchButton} onPress={handleSearch}>
          <Text style={styled.searchButtonText}>検索</Text>
        </TouchableOpacity>
      </View>

      {searchText.length > 0 && (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styled.list}
        />
      )}
    </View>
  );
};

const styled = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 500,
    height: "auto",
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 5,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
  },
});

export default SearchComponent;
