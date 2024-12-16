#![allow(unused_variables)]

use wasm_bindgen::prelude::*;
use tokenizers::{Tokenizer, Encoding};
use std::str::FromStr;
use js_sys::{Array, Uint32Array};
use wasm_bindgen::JsValue;

#[wasm_bindgen]
#[allow(dead_code)]
pub struct EncodingWrapper {
    encoding: Encoding,
}

#[wasm_bindgen]
impl EncodingWrapper {
    /// Get the encoded tokens
    /// @returns {Array<string>}
    #[wasm_bindgen(getter = tokens)]
    pub fn get_tokens(&self) -> Array {
        self.encoding.get_tokens().iter()
            .map(|s| JsValue::from_str(s))
            .collect::<Array>()
    }

    /// Get the encoded word_ids
    /// @returns {Array<number | null>}
    #[wasm_bindgen(getter = word_ids)]
    pub fn get_word_ids(&self) -> Array {
        self.encoding.get_word_ids().iter()
            .map(|opt| match opt {
                Some(id) => JsValue::from_f64(*id as f64),
                None => JsValue::null()
            })
            .collect::<Array>()
    }

    /// Get the encoded sequence_ids
    /// @returns {Array<number | null>}
    #[wasm_bindgen(getter = sequence_ids)]
    pub fn get_sequence_ids(&self) -> Array {
        self.encoding.get_sequence_ids().iter()
            .map(|opt| match opt {
                Some(id) => JsValue::from_f64(*id as f64),
                None => JsValue::null()
            })
            .collect::<Array>()
    }

    /// Get the encoded ids
    /// @returns {Uint32Array}
    #[wasm_bindgen(getter = ids)]
    pub fn get_ids(&self) -> Uint32Array {
        Uint32Array::from(self.encoding.get_ids())
    }

    /// Get the encoded type_ids
    /// @returns {Uint32Array}
    #[wasm_bindgen(getter = type_ids)]
    pub fn get_type_ids(&self) -> Uint32Array {
        Uint32Array::from(self.encoding.get_type_ids())
    }

    /// Get the encoded offsets
    /// @returns {Array<[number, number]>}
    #[wasm_bindgen(getter = offsets)]
    pub fn get_offsets(&self) -> Array {
        self.encoding.get_offsets().iter()
            .map(|offset| {
                let arr = Array::new_with_length(2);
                arr.set(0, JsValue::from_f64(offset.0 as f64));
                arr.set(1, JsValue::from_f64(offset.1 as f64));
                arr
            })
            .collect::<Array>()
    }

    /// Get the encoded special_tokens_mask
    /// @returns {Uint32Array}
    #[wasm_bindgen(getter = special_tokens_mask)]
    pub fn get_special_tokens_mask(&self) -> Uint32Array {
        Uint32Array::from(self.encoding.get_special_tokens_mask())
    }

    /// Get the encoded attention_mask
    /// @returns {Uint32Array}
    #[wasm_bindgen(getter = attention_mask)]
    pub fn get_attention_mask(&self) -> Uint32Array {
        Uint32Array::from(self.encoding.get_attention_mask())
    }

    /// Get the encoded overflowing
    /// @returns {Array<EncodingWrapper>}
    #[wasm_bindgen(getter = overflowing)]
    pub fn get_overflowing(&self) -> Array {
        self.encoding.get_overflowing().iter()
            .map(|encoding| {
                JsValue::from(EncodingWrapper {
                    encoding: encoding.clone()
                })
            })
            .collect::<Array>()
    }
}

#[wasm_bindgen]
pub struct TokenizerWrapper {
    /// Tokenizer
    tokenizer: Tokenizer,
}

#[wasm_bindgen]
impl TokenizerWrapper {
    /// Create a new tokenizer
    #[wasm_bindgen(constructor)]
    pub fn new(json: String) -> Result<TokenizerWrapper, JsValue> {
        let tokenizer = Tokenizer::from_str(&json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(TokenizerWrapper { tokenizer })
    }

    /// Encode text
    /// @param {string} text - Input text
    /// @param {boolean} add_special_tokens - Whether to add special tokens
    /// @returns {EncodingWrapper}
    #[wasm_bindgen]
    pub fn encode(&self, text: &str, add_special_tokens: bool) -> Result<EncodingWrapper, JsValue> {
        let encoding = self.tokenizer.encode(text, add_special_tokens)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(EncodingWrapper { encoding })
    }

    /// Batch encode texts
    /// @param {Array<string>} texts - Input texts
    /// @param {boolean} add_special_tokens - Whether to add special tokens
    /// @returns {Array<EncodingWrapper>}
    #[wasm_bindgen]
    pub fn encode_batch(&self, texts: Array, add_special_tokens: bool) -> Result<Vec<EncodingWrapper>, JsValue> {
        let texts: Vec<String> = texts.to_vec()
            .into_iter()
            .map(|v| v.as_string().unwrap())
            .collect();
        let encodings = self.tokenizer.encode_batch(texts, add_special_tokens)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(encodings.into_iter().map(|e| EncodingWrapper { encoding: e }).collect())
    }

    /// Decode ids to text
    /// @param {Array<number>} ids - Input ids
    /// @param {boolean} skip_special_tokens - Whether to skip special tokens
    /// @returns {string}
    #[wasm_bindgen]
    pub fn decode(&self, ids: Array, skip_special_tokens: bool) -> Result<String, JsValue> {
        let ids: Vec<u32> = ids.to_vec()
            .into_iter()
            .map(|v| v.as_f64().unwrap() as u32)
            .collect();
        self.tokenizer.decode(&ids, skip_special_tokens)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Batch decode ids to texts
    /// @param {Array<Array<number>>} sentences - Input ids
    /// @param {boolean} skip_special_tokens - Whether to skip special tokens
    /// @returns {Array<string>}
    #[wasm_bindgen]
    pub fn decode_batch(&self, sentences: Array, skip_special_tokens: bool) -> Result<Vec<String>, JsValue> {
        let ids_batch: Vec<Vec<u32>> = sentences.to_vec()
            .into_iter()
            .map(|arr| {
                let arr = Array::from(&arr);
                arr.to_vec()
                    .into_iter()
                    .map(|v| v.as_f64().unwrap() as u32)
                    .collect()
            })
            .collect();
        
        let refs: Vec<&[u32]> = ids_batch.iter().map(|v| v.as_slice()).collect();
        self.tokenizer.decode_batch(&refs, skip_special_tokens)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Fast encode (without computing offsets)
    /// @param {string} text - Input text
    /// @param {boolean} add_special_tokens - Whether to add special tokens
    /// @returns {EncodingWrapper}
    #[wasm_bindgen]
    pub fn encode_fast(&self, text: &str, add_special_tokens: bool) -> Result<EncodingWrapper, JsValue> {
        let encoding = self.tokenizer.encode_fast(text, add_special_tokens)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(EncodingWrapper { encoding })
    }

    /// Batch encode pre-tokenized inputs
    /// @param {Array<string>} texts - Input texts
    /// @param {boolean} add_special_tokens - Whether to add special tokens
    /// @returns {Array<EncodingWrapper>}
    #[wasm_bindgen]
    pub fn encode_batch_fast(&self, texts: Array, add_special_tokens: bool) -> Result<Vec<EncodingWrapper>, JsValue> {
        let texts: Vec<String> = texts.to_vec()
            .into_iter()
            .map(|v| v.as_string().unwrap())
            .collect();
        let encodings = self.tokenizer.encode_batch_fast(texts, add_special_tokens)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(encodings.into_iter().map(|e| EncodingWrapper { encoding: e }).collect())
    }
}
