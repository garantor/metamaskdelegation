import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

type ColoredLabelProps = {
  text: React.ReactNode;
  borderColor?: string;
  style?: object;
};

export const ColoredLabel: React.FC<ColoredLabelProps> = ({
  text,
  borderColor = '#3498db',
  style = {},
}) => (
  <ThemedView style={[styles.container, { borderColor }, style]}>
    <ThemedText style={styles.text}>{text}</ThemedText>
  </ThemedView>
);


const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
    margin: 4,
  },
  text: {
    fontSize: 16,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});