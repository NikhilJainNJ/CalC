import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Math.round(Dimensions.get('window').width);
const SCREEN_HEIGHT = Math.round(Dimensions.get('window').height);

const App = () => {
  // Buttons list
  const OPTS = [
    {key: 12, btn: 'AC'},
    {key: 13, btn: 'DEL'},
    {key: 14, btn: '%'}
  ];
  const NUMBERS = [
    {key: 9, num: '0'}, {key: 10, num: '00'}, {key: 11, num: '.'},
    ...Array.from({ length: 9 }, (_, k) => ({ key: k, num: k+1 }))
  ];
  const LEFT_BTNS = [ ...NUMBERS, ...OPTS ];
  const MAIN_OPERATORS = [
    { key: 0, operator: '/' },
    { key: 1, operator: '*' },
    { key: 2, operator: '-' },
    { key: 3, operator: '+' },
    { key: 4, btn: '=' }
  ];
  
  const [ inputValue, setInputValue ] = useState('');
  const [ resultValue, setResultValue ] = useState('');
  const [ opStack, setOpStack ] = useState([]);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  
  const onClick = (item, index) => {
    console.log('Button clicked!! ==> ', item);
    const ops = ['/', '*', '-', '+']
    if(item.num)
      setInputValue(i => i+item.num);
    else if(item.operator) {
      if ((item.operator != '-' && inputValue.length === 0) || (opStack.length === 1 && inputValue.length === 1)) return

      let v = inputValue;
      let arr = opStack;
      if (ops.includes(v.charAt(v.length-1))) {
        // call del func & then add item.operator
        setInputValue(i => i.slice(0, i.length-1)+item.operator);
        arr.pop();
        arr.push(item.operator);
      } else {
        setInputValue(i => i+item.operator);
        arr.push(item.operator);
      }
      setOpStack(arr);
    }
    else if(item.btn == 'AC')
      setInputValue('') || setResultValue('') || setOpStack([]);
    else if(item.btn == 'DEL') {
      setInputValue(i => i.slice(0, i.length-1));
      let v = inputValue;
      let arr = opStack;
      if (ops.includes(v.charAt(v.length-1))) {
        arr.pop();
        setOpStack(arr);
      }
    } else if(item.btn == '=') {
      if ( (inputValue.length === 0) ||
      (opStack.length == 1 && inputValue.length === 1)) return

      // -- ***** -- CALCULATION PART -- ***** --
      let stack1 = inputValue.split('+');
      let stack2 = stack1.reduce(
        (acc, curr) => {
          let interRes = curr.split('-');
          return [ ...acc, ...interRes ];
        }, []
      );
      let stack3 = stack2.reduce(
        (acc, curr) => {
          let interRes = curr.split('*');
          return [ ...acc, ...interRes ];
        }, []
      );
      let stack4 = [];
      stack4 = stack3.reduce(
        (acc, curr) => {
          let interRes = curr.split('/');
          return [ ...acc, ...interRes ];
        }, []
      );
      console.log(stack4);
      console.log(opStack);
      let inpOps = [ ...opStack ], index = 0;
      // while (inpOps.length > 0) {
        while (inpOps.indexOf('/') >= 0) {
          index = inpOps.indexOf('/');
          console.log('index of / =', index);
          
          inpOps.splice(index, 1);
          stack4.splice(index, 2, `${stack4[index]/stack4[index+1]}`);
          
          console.log('values stack ======== ', stack4);
        }
        console.log('OPSTACK ======> "/" ', inpOps)
        
        while (inpOps.indexOf("*") >= 0) {
          index = inpOps.indexOf("*");
          console.log('index of * =', index);
          
          inpOps.splice(index, 1);
          stack4.splice(index, 2, `${stack4[index]*stack4[index+1]}`);
          
          console.log('values stack = ', stack4);
        }
        console.log('OPSTACK ======> ', inpOps);
        
        while (inpOps.indexOf('+') >= 0) {
          index = inpOps.indexOf('+');
          console.log('index of + =', index);
          
          inpOps.splice(index, 1);
          let sum = `${index != 0 ? inpOps[index-1] : '+'}1` * Number(stack4[index]) + Number(stack4[index+1]);
          // console.log('SUM value ---> ', sum);
          
          sum = index != 0 && inpOps[index-1] === '-' ? sum * -1 : sum;
          stack4.splice(index, 2, `${sum}`);
          
          console.log('values stack = ', stack4);
        }
        console.log('OPSTACK ======> ', inpOps);
        
        while (inpOps.indexOf('-') >= 0) {
          index = inpOps.indexOf('-');
          console.log('index of - =', index);
          
          inpOps.splice(index, 1);
          if (stack4[index] === '') {
            // stack4.splice(index, 1);
            // continue;
          }
          let diff = stack4[index]-stack4[index+1];
          // console.log('DIFF value --> ', diff);
          stack4.splice(index, 2, `${diff}`);
          
          console.log('values stack = ', stack4);
        }
        console.log('OPSTACK ======> ', inpOps);
        console.log('FINAL values stack ======> ', stack4);
      // }
      const res = stack4[0] === 'NaN' ? '0' : stack4[0];
      setResultValue(res);
    }
  };
  
  const renderBtns = (item, index) => (
    <TouchableOpacity
      style={[styles.inpBtn, item.btn === '=' && {backgroundColor: 'lightblue'}, item.btn === '%' && {backgroundColor: 'rgb(50, 164, 255)'} ]}
      disabled={item.btn === '%'}
      onPress={() => onClick(item, index)}
    >
      <View>
        <Text style={styles.inpBtnText}>{`${item.num || item.btn || item.operator}`}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.calculateBox}>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            ref={inputRef}
            onContentSizeChange={() => inputRef?.current.scrollToEnd()}
          >
            <Text style={[styles.inpValueText, ]}>{`${inputValue}`}</Text>
          </ScrollView>
        </View>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            ref={outputRef}
            onContentSizeChange={() => outputRef?.current.scrollToEnd()}
          >
            <Text style={[styles.inpValueText, ]}>{`${resultValue}`}</Text>
          </ScrollView>
        </View>
      </View>
      <View style={styles.btnsBox}>
        <View style={styles.sectionField}>
          <FlatList
            data={LEFT_BTNS}
            keyExtractor={item => item.key}
            renderItem={({ item, index }) => renderBtns(item, index)}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-evenly' }}
            contentContainerStyle={styles.opsBtnBox}
          />
        </View>
        <View style={[styles.sectionField, ]}>
          <FlatList
            data={MAIN_OPERATORS}
            keyExtractor={item => item.key}
            renderItem={({ item, index }) => renderBtns(item, index)}
            contentContainerStyle={styles.rightField}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  calculateBox: {
    // height: '30%',
    flex: 1,
    // height: SCREEN_HEIGHT/3,
    backgroundColor: 'lightblue',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    overflow: 'scroll',
  },
  inpValueText: {
    fontSize: 50,
    lineHeight: 60,
    // borderWidth: 1,
    // overflow: 'scroll'
  },
  btnsBox: {
    width: '100%',
    // height: '70%',
    // flex: 1,
    backgroundColor: 'steelblue',
    flexDirection: 'row',
  },
  sectionField: {
    width: '75%',
  },
  rightField: {
    paddingVertical: 15,
  },
  opsBtnBox: {
    flexDirection: 'column-reverse',
    paddingVertical: 15,
  },
  inpBtn: {
    width: SCREEN_HEIGHT/10,
    aspectRatio: 1,
    marginVertical: 10,
    backgroundColor: 'deepskyblue',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    shadowColor: 'darkblue',
  },
  inpBtnText: {
    fontSize: 30,
    fontWeight: '700',
  },
});

export default App;