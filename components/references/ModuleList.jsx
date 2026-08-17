import React from "react";
import { View, Text } from "react-native";

import ModuleFolder from "./ModuleFolder";

import styles from "../../styles/referencesStyles";

export default function ModuleList(){

    const modules =[
        {id:'1', module: 'Database Systems'},
        {id:'2', module: 'Operating Sytems'},
        {id:'3', module: 'Telecommunications'},
        {id:'4', module: 'Articial Inteligence'},
        {id:'5', module: 'Server Administration'},
        {id:'6', module: 'Digital Electronics'}
    ];
    return(

        <View>

            <Text style={styles.sectionTitle}>
                Browse by Module
            </Text>

            {modules.map((title) =>(
                 <ModuleFolder key={title.id} title={title.module} />
            ))}

        </View>

    );

}