import React from "react";

import {

    TouchableOpacity,

} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/homeStyles";

export default function FloatingRecordButton(){

    return(

        <TouchableOpacity style={styles.floatingButton}>

            <Ionicons

                name="mic"

                size={32}

                color="#FFFFFF"

            />

        </TouchableOpacity>

    );

}