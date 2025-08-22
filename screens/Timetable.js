import React, { useState,useEffect } from "react";
import { View, Text, Button, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { analyzeTimetable } from "./../gemini";
import { supabase } from "../supabase";  // ⬅️ import client

export default function TimetableScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");


  const loadTimetable = async () => {
    const { data, error } = await supabase
      .from("timetables")
      .select("timetable")
      .eq("user_id", "test-user") // later replace with real user_id
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
    } else if (data.length > 0) {
      setResult(data[0].timetable);
    }
  };

  useEffect(() => {
    loadTimetable(); // ⬅️ fetch timetable on screen load
  }, []);


  const pickImage = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);

      const base64 = res.assets[0].base64;
      const aiResult = await analyzeTimetable(base64);

      setResult(aiResult);

      // ✅ Save to Supabase
      const { data, error } = await supabase
        .from("timetables")
        .insert([{ user_id: "test-user", timetable: aiResult }]);

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Saved to Supabase:", data);
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Button title="Pick Timetable Image" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 200, marginVertical: 20 }}
          resizeMode="contain"
        />
      )}
      <Text style={{ marginTop: 20 }}>{JSON.stringify(result, null, 2)}</Text>
    </ScrollView>
  );
}
