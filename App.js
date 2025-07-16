import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  VolumeManager,
  useRingerMode,
  RINGER_MODE,
} from "react-native-volume-manager";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

const audioSource = require("./assets/Hello.mp3");

const modeText = {
  [RINGER_MODE.silent]: "Silent",
  [RINGER_MODE.normal]: "Normal",
  [RINGER_MODE.vibrate]: "Vibrate",
};

function nullishBooleanToString(value) {
  return value === undefined ? "unset" : value ? "YES" : "NO";
}

export default function VolumeManagerApp() {
  const [currentSystemVolume, setReportedSystemVolume] = useState(0);
  const [isMuted, setIsMuted] = useState();
  const [initialQuery, setInitialQuery] = useState();
  const [ringerStatus, setRingerStatus] = useState();
  const [hideUI, setHideUI] = useState(false);
  const volumeChangedByListener = useRef(true);

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
    VolumeManager.showNativeVolumeUI({ enabled: !hideUI });
  }, [hideUI]);

  useEffect(() => {
    // Enable or disable iOS AudioSession
    VolumeManager.enable(true, true); // Enable async
    VolumeManager.enable(false, true); // Disable async, non-blocking

    // Activate or deactivate the audio session
    VolumeManager.setActive(true, true); // Activate async
    VolumeManager.setActive(false, true); // Deactivate async, non-blocking

    VolumeManager.getVolume().then((result) => {
      setReportedSystemVolume(result.volume);
      console.log("Read system volume", result);
    });

    const volumeListener = VolumeManager.addVolumeListener((result) => {
      volumeChangedByListener.current = true;

      if (
        (Platform.OS === "android" && result.type === "music") ||
        Platform.OS === "ios"
      ) {
        setReportedSystemVolume(result.volume);
        console.log("Volume changed, updating state", result);
      } else {
        console.log(
          "Volume changed, but not for type music, not updating state",
          result
        );
      }
    });

    const silentListener = VolumeManager.addSilentListener((status) => {
      console.log(status);
      setIsMuted(status.isMuted);
      setInitialQuery(status.initialQuery);
    });

    const ringerListener = VolumeManager.addRingerListener((result) => {
      console.log("Ringer listener changed", result);
      setRingerStatus(result);
    });

    return () => {
      volumeListener.remove();
      silentListener.remove();
      VolumeManager.removeRingerListener(ringerListener);
    };
  }, []);

  const { mode, error, setMode } = useRingerMode();

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {!isNaN(player.duration) && player.duration > 0 ? (
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
        ) : (
          ""
        )}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>iOS / Android</Text>
          <View style={styles.row}>
            <Text style={styles.text}>Current volume:</Text>
            <Text style={styles.text}>{currentSystemVolume}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.text}>Is muted?:</Text>
            <Text style={styles.text}>
              {currentSystemVolume <= 0 ? "YES" : "NO"}
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={styles.text}>
              Volume update {hideUI ? "(without toast)" : "(with toast)"}
            </Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#000"
            maximumTrackTintColor="#999"
            onValueChange={(value) => {
              VolumeManager.setVolume(value, { showUI: !hideUI });
            }}
            onSlidingComplete={async (value) => {
              setReportedSystemVolume(value);
            }}
            value={currentSystemVolume}
            step={0.001}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => setHideUI((shouldHide) => !shouldHide)}
          >
            <Text style={styles.buttonText}>
              {hideUI ? "Show native volume Toast" : "Hide native volume Toast"}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 10 }} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>iOS only features</Text>
            <View style={styles.row}>
              <Text style={styles.text}>Silent switch active?:</Text>
              <Text style={styles.text}>
                {Platform.OS === "ios"
                  ? `${nullishBooleanToString(
                      isMuted
                    )} (initial query: ${nullishBooleanToString(initialQuery)})`
                  : "Unsupported on Android"}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Android only features</Text>
            <View style={styles.row}>
              <Text style={styles.text}>Ringer Mode listener:</Text>
              <Text style={styles.text}>{ringerStatus?.mode}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.text}>Selected Ringer Mode:</Text>
              <Text style={styles.text}>
                {mode !== undefined
                  ? modeText[mode]
                  : Platform.OS === "ios"
                  ? "Unsupported on iOS"
                  : "Unknown"}
              </Text>
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.text}>Set Ringer mode:</Text>
              <View
                style={{
                  marginTop: 20,
                  height: 120,
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Button
                  title="Silent"
                  onPress={() => setMode(RINGER_MODE.silent)}
                />
                <Button
                  title="Normal"
                  onPress={() => setMode(RINGER_MODE.normal)}
                />
                <Button
                  title="Vibrate"
                  onPress={() => setMode(RINGER_MODE.vibrate)}
                />
                <Button
                  title="Check if device is silent"
                  onPress={async () => {
                    const result = await VolumeManager.isAndroidDeviceSilent();
                    Alert.alert(
                      "Info",
                      result
                        ? "Device is silent. This is a silent mode or muted volume or vibrate mode or do not disturb mode."
                        : "Device is not silent. This is a normal mode. Check ringer mode to get more details"
                    );
                  }}
                />
              </View>
            </View>

            <View>
              <View />
              <View
                style={{
                  marginTop: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.text}>{error?.message}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  card: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  text: {
    fontSize: 16,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#000",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
});
