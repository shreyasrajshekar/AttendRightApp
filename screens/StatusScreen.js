import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { supabase } from "../supabase";

const MIN_ATTENDANCE = 85;

export default function StatusScreen() {
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch latest attendance (attendance_data column)
      const { data: attendanceRows, error: attError } = await supabase
        .from("attendance")
        .select("attendance_data")
        .order("created_at", { ascending: false })
        .limit(1);

      if (attError) throw attError;

      let attendanceJson = [];
      if (attendanceRows && attendanceRows.length > 0) {
        const raw = attendanceRows[0].attendance_data;
        if (Array.isArray(raw)) {
          attendanceJson = raw;
        } else if (typeof raw === "string") {
          const parsed = JSON.parse(raw);
          attendanceJson = Array.isArray(parsed) ? parsed : [parsed];
        } else if (typeof raw === "object" && raw !== null) {
          attendanceJson = [raw];
        }
      }
      setAttendance(attendanceJson);

      // Fetch latest timetable (timetable column)
      const { data: ttData, error: ttError } = await supabase
        .from("timetables")
        .select("timetable")
        .order("created_at", { ascending: false })
        .limit(1);

      if (ttError) throw ttError;

      let timetableJson = [];
      if (ttData && ttData.length > 0) {
        const raw = ttData[0].timetable;
        if (Array.isArray(raw)) {
          timetableJson = raw;
        } else if (typeof raw === "string") {
          const parsed = JSON.parse(raw);
          timetableJson = Array.isArray(parsed) ? parsed : [parsed];
        } else if (typeof raw === "object" && raw !== null) {
          timetableJson = [raw];
        }
      }
      setTimetable(timetableJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getAISuggestions(attendanceArr, timetableJson) {
    const suggestions = [];

    attendanceArr.forEach((subj) => {
      const pct = parseFloat(subj["Percentage %"] || 0);

      if (pct > MIN_ATTENDANCE) {
        // Try to find subject in timetable JSON
        const nextClass = Array.isArray(timetableJson)
          ? timetableJson.find(
              (tt) =>
                tt.subject?.toLowerCase() === subj.Subject?.toLowerCase()
            )
          : null;

        if (nextClass) {
          // Calculate how many classes can be bunked
          const total = subj.Total || 0;
          const present = subj.Present || 0;
          let canBunk = 0;

          // calculate bunkable classes
          while (
            ((present / (total + canBunk)) * 100) >= MIN_ATTENDANCE
          ) {
            canBunk++;
          }
          canBunk = Math.max(0, canBunk - 1);

          suggestions.push(
            `✅ You are eligible (${pct}%). You can bunk around ${canBunk} more "${subj.Subject}" classes (next on ${nextClass.day || "?"} at ${nextClass.time || "?"}).`
          );
        } else {
          suggestions.push(
            `✅ You are eligible (${pct}%). You can bunk future "${subj.Subject}" classes.`
          );
        }
      } else {
        suggestions.push(
          `⚠️ You are NOT eligible for "${subj.Subject}" (only ${pct}%).`
        );
      }
    });

    if (suggestions.length === 0) {
      suggestions.push("No attendance data available.");
    }
    return suggestions;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  const aiSuggestions = getAISuggestions(attendance, timetable);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📊 Attendance Status</Text>
      {attendance.map((subj, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.subj}>{subj.Subject}</Text>
          <Text>Total: {subj.Total}</Text>
          <Text>Present: {subj.Present}</Text>
          <Text style={{ color: subj["Percentage %"] >= MIN_ATTENDANCE ? "green" : "red" }}>
            Percentage: {subj["Percentage %"]}%
          </Text>
        </View>
      ))}

      <Text style={styles.header}>🤖 AI Suggestions</Text>
      {aiSuggestions.map((s, idx) => (
        <Text key={idx} style={styles.suggestion}>• {s}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  subj: {
    fontSize: 18,
    fontWeight: "600",
  },
  suggestion: {
    fontSize: 16,
    marginVertical: 4,
  },
  error: {
    color: "red",
    fontSize: 16,
  },
});