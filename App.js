import { View, StyleSheet, Button } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Slider from "@react-native-community/slider";
import { useEffect } from "react";

const audioSource = require("./assets/Hello.mp3");

export default function Audio() {
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  const onSlide = async (value) => {
    await player.seekTo(value);
  };

  const replaySoundHandler = () => {
    player.seekTo(0);
    player.play();
  };

  useEffect(() => {
    // console.log("player =>", player);
    // console.log("player status =>", status);
  }, [player]);

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={player.duration}
        value={player.currentTime}
        onSlidingComplete={onSlide}
        tapToSeek
      />
      <View style={styles.controls}>
        <Button title="Play" onPress={() => player.play()} />
        <Button title="Pause" onPress={() => player.pause()} />
        <Button title="Replay" onPress={replaySoundHandler} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 50,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  time: {
    fontSize: 14,
    color: "#555",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    rowGap: 20,
  },
});
