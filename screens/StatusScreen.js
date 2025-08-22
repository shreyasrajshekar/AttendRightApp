import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../supabase';
import { getClientId } from '../utils/clientId';

export default function StatusScreen() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const id = await getClientId();
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', id)
        .order('updated_at', { ascending: false });
      if (!error) setRows(data || []);
    })();
  }, []);

  const renderItem = ({ item }) => {
    const T = item.total_classes || 0;
    const A = item.attended_classes || 0;
    const p = (item.min_required_percent || 75) / 100;
    const percent = T > 0 ? (A / T) * 100 : 0;
    const bunkable = Math.floor(Math.max(0, (A / p) - T)); // x <= A/p - T
    const needToAttend = Math.max(0, Math.ceil(p * T - A));

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.course_code}{item.course_name ? ` — ${item.course_name}` : ''}</Text>
        <Text>Attendance: {A}/{T} ({percent.toFixed(1)}%)</Text>
        <Text>You can miss now: {bunkable}</Text>
        <Text>Need to attend to reach target: {needToAttend}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.h1}>Attendance Status</Text>
      <FlatList
        data={rows}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No data yet.</Text>}
        contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#f7f9fc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e6ecf2' },
  title: { fontWeight: '700', marginBottom: 4 },
});
