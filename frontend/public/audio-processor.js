class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunkSize = 320; // 20ms at 16kHz (320 samples)
    this.buffer = new Float32Array(this.chunkSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Accumulate samples in buffer
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        // When buffer is full, convert to PCM and send
        if (this.bufferIndex >= this.chunkSize) {
          const pcm = new Int16Array(this.chunkSize);
          
          // Convert float32 [-1,1] to int16 [-32768,32767]
          for (let j = 0; j < this.chunkSize; j++) {
            const sample = Math.max(-1, Math.min(1, this.buffer[j]));
            pcm[j] = sample * 0x7FFF;
          }
          
          // Send PCM data to main thread
          this.port.postMessage(pcm.buffer, [pcm.buffer]);
          
          // Reset buffer
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
