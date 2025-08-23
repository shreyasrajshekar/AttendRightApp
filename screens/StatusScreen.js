import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../supabase";

export default function StatusScreen() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("extracted_data")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        setError("No attendance uploaded yet.");
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(data[0].extracted_data);

      if (!Array.isArray(parsed)) {
        setError("Invalid attendance format.");
        setLoading(false);
        return;
      }

      // calculate total
      const totalConducted = parsed.reduce(
        (sum, s) => sum + (s["Conducted Classes"] || 0),
        0
      );
      const totalAttended = parsed.reduce(
        (sum, s) => sum + (s["Attended Classes"] || 0),
        0
      );
      const overallPercentage =
        totalConducted > 0
          ? ((totalAttended / totalConducted) * 100).toFixed(2)
          : "0.00";

      // find lowest subject
      const minSubject = parsed.reduce((min, s) => {
        const pct = parseFloat(s["Percentage %"]) || 0;
        return pct < min.pct ? { name: s.Subject, pct } : min;
      }, { name: "", pct: 101 });

      setAttendance({
        overallPercentage,
        minSubject,
      });
    } catch (err) {
      setError("Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading attendance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Attendance Status</Text>
      <Text style={styles.text}>Overall Attendance: {attendance.overallPercentage}%</Text>
      <Text style={styles.text}>
        Lowest Subject: {attendance.minSubject.name} ({attendance.minSubject.pct}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16, marginVertical: 5 },
  error: { fontSize: 16, color: "red" },
});
