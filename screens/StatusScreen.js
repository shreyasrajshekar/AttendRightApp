import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { supabase } from "../supabase";

export default function AttendanceScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: attendanceRes, error: attendanceErr } = await supabase
          .from("attendance")
          .select("attendance_data")
          .single();

        if (attendanceErr) throw attendanceErr;

        let attendanceData = [];
        if (typeof attendanceRes.attendance_data === "string") {
          attendanceData = JSON.parse(attendanceRes.attendance_data);
        } else {
          attendanceData = attendanceRes.attendance_data;
        }

        const { data: timetableRes, error: timetableErr } = await supabase
          .from("timetables")
          .select("*");

        if (timetableErr) throw timetableErr;

        const today = new Date();

        const processed = attendanceData.map((att) => {
          const timetable = timetableRes.find(
            (t) =>
              t.subject.trim().toLowerCase() ===
              att.Subject.trim().toLowerCase()
          );

          let remainingClasses = 0;
          let maxBunkable = 0;
          let projectedPercentage = parseFloat(att["Percentage %"]);
          let projectedIfBunkAll = projectedPercentage;

          if (timetable) {
            const examDate = new Date(timetable.exam_start_date);
            const diffTime = examDate - today;
            const weeksRemaining = Math.ceil(
              diffTime / (7 * 24 * 60 * 60 * 1000)
            );

            if (weeksRemaining > 0) {
              remainingClasses = weeksRemaining * timetable.classes_per_week;
            }

            const totalFuture = att.Total + remainingClasses;
            projectedPercentage =
              ((att.Present + remainingClasses) / totalFuture) * 100;

            const minRequired = Math.ceil(totalFuture * 0.85);

            maxBunkable = Math.max(
              0,
              totalFuture - minRequired - (att.Total - att.Present)
            );

            projectedIfBunkAll =
              maxBunkable > 0
                ? (att.Present / (att.Total + maxBunkable)) * 100
                : projectedPercentage;
          }

          return {
            subject: att.Subject,
            total: att.Total,
            attended: att.Present,
            percentage: parseFloat(att["Percentage %"]),
            projectedPercentage,
            projectedIfBunkAll,
            remainingClasses,
            maxBunkable,
          };
        });

        setData(processed);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };

    fetchData();
  }, []);

  const renderCard = ({ item }) => (
    <View
      style={[
        styles.card,
        item.projectedPercentage < 85 && styles.cardDanger,
      ]}
    >
      {/* Subject Name */}
      <Text style={styles.subject}>{item.subject}</Text>

      {/* Current Attendance */}
      <View style={styles.row}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.value}>{item.total}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Attended:</Text>
        <Text style={styles.value}>{item.attended}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Current %:</Text>
        <Text
          style={[
            styles.value,
            item.percentage < 85 && styles.textDanger,
          ]}
        >
          {item.percentage.toFixed(2)}%
        </Text>
      </View>

      {/* Future Projections */}
      <View style={styles.separator} />

      <View style={styles.row}>
        <Text style={styles.label}>Remaining:</Text>
        <Text style={styles.value}>{item.remainingClasses}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Max Bunkable:</Text>
        <Text style={styles.value}>{item.maxBunkable}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>If attend all:</Text>
        <Text
          style={[
            styles.value,
            item.projectedPercentage < 85 && styles.textDanger,
          ]}
        >
          {item.projectedPercentage.toFixed(2)}%
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>
          If bunk all ({item.maxBunkable}):
        </Text>
        <Text
          style={[
            styles.value,
            item.projectedIfBunkAll < 85 && styles.textDanger,
          ]}
        >
          {item.projectedIfBunkAll.toFixed(2)}%
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderCard}
      contentContainerStyle={{ padding: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#eefffeff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardDanger: {
    borderColor: "#ff4d4d",
    backgroundColor: "#fff5f5",
  },
  subject: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  textDanger: {
    color: "#d32f2f",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
});
