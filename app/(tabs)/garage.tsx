import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import Navbar from "@/components/navbar";
import { saveUserCarDetails, UserCarDetails } from "../backend/AsyncStorage";


export default function CarDetails() {


  const [carModel, setCarModel] = useState<string>();

  const [vinNo, setVinNo] = useState<string>();

  const [extraDetail, setExtraDetail] = useState<string>();




  const [engineType, setEngineType] = useState<"Electric" | "Gas" | null>(
    "Gas"
  );
  const [fuelType, setFuelType] = useState<"Petrol" | "Diesel" | null>(
    "Petrol"
  );

  return (
    <>

      <View
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{paddingBottom: 60 }}
      >
      <Navbar />
        {/* Top Bar */}

      <View style={{padding: 20}}>

        {/* Title */}
        <Text
          style={{
            fontSize: 34,
            fontWeight: "700",
            marginBottom: 10,
            lineHeight: 38,
          }}
        >
          Enter your{"\n"}car details
        </Text>

        {/* Car Model & Make */}
    <View style={{ marginTop: 20 }}>
    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Car Model & Make</Text>

    <TextInput
      placeholder="e.g. Toyota Corolla"
      style={{
        backgroundColor: "#f3f3f3",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
      onChangeText={(setCarModel)}
    />

    {/* Engine Type label under input */}
    <Text style={{ fontWeight: "700", marginTop: 12, marginBottom: 6 }}>
      Engine type
    </Text>

    {/* Engine Toggle */}
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#ddd",
        borderRadius: 20,
        padding: 3,
        alignSelf: "flex-start",
      }}
    >
      {["Electric", "Gas"].map((type) => {
        const selected = engineType === type;
        return (
          <Pressable
            key={type}
            onPress={() => {
              if (type == "Electric"){
                setFuelType(null);
              }
              setEngineType(type as any)

            }
            }
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: selected ? "#345CFF" : "transparent",
            }}
          >
            <Text
              style={{
                color: selected ? "#fff" : "#555",
                fontWeight: "600",
              }}
            >
              {type}
            </Text>
          </Pressable>
        );
      })}
    </View>
    </View>


    {/* VIN Number */}
    <View style={{ marginTop: 25 }}>
    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Vin Number</Text>

    <TextInput
      placeholder="e.g. Toyota Corolla"
      style={{
        backgroundColor: "#f3f3f3",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
      onChangeText={setVinNo}
    />

    {/* Fuel Type ONLY when engine is Gas */}
    {engineType === "Gas" && (
      <>
        <Text style={{ fontWeight: "700", marginTop: 12, marginBottom: 6 }}>
          Fuel Type
        </Text>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#ddd",
            borderRadius: 20,
            padding: 3,
            alignSelf: "flex-start",
          }}
        >
          {["Petrol", "Diesel"].map((type) => {
            const selected = fuelType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setFuelType(type as any)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  backgroundColor: selected ? "#4CAF50" : "transparent",
                }}
              >
                <Text
                  style={{
                    color: selected ? "#fff" : "#555",
                    fontWeight: "600",
                  }}
                >
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </>
    )}
    </View>


        {/* Extra Specifics */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>
            Extra Specifics
          </Text>
          <TextInput
            multiline
            placeholder="Input any extra details that may be important for service garages."
            style={{
              backgroundColor: "#f3f3f3",
              borderRadius: 12,
              padding: 12,
              minHeight: 130,
              textAlignVertical: "top",
            }}
            onChangeText={setExtraDetail}
          />
        </View>

        {/* Save Button */}
        <Pressable
          style={{
            backgroundColor: "#FFB869",
            paddingVertical: 16,
            alignSelf: "center",
            marginTop: 20,
            borderRadius: 20,
            paddingHorizontal: 40,
          }}
          onPress={() => {

            if (!carModel?.trim() || !vinNo?.trim() || !extraDetail?.trim()){
              alert("Please fill in all details.")
              return;
            }
            const body: UserCarDetails = {
              model: carModel!,
              vNumber: vinNo!,
              detail: extraDetail!,
              fuelType: fuelType!,
              engineType: engineType! 
            }

            saveUserCarDetails(body);

          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16 }}>Save Vehicle</Text>
        </Pressable>
        </View>
      </View>
    </>
  );
}
