import * as vscode from 'vscode';

/**
 * Documentation entry structure
 */
interface DocEntry {
	signature: string;
	description: string;
	example: string;
}

/**
 * Documentation data for Devalang keywords, functions, and concepts
 */
const DEVALANG_DOCS: Record<string, DocEntry> = {
	// Configuration keywords
	'tempo': {
		signature: 'tempo <number>',
		description: 'Sets the global tempo of the project in BPM (beats per minute). Alias: bpm',
		example: 'tempo 128'
	},
	'bpm': {
		signature: 'bpm <number>',
		description: 'Sets the global tempo of the project in BPM (beats per minute). Alias for tempo',
		example: 'bpm 140'
	},
	'bank': {
		signature: 'bank <name> as <alias>',
		description: 'Loads a sound bank and assigns it an alias for pattern usage',
		example: 'bank devaloop.808 as drums'
	},

	// Variable keywords
	'let': {
		signature: 'let <name> = <value>',
		description: 'Declares a variable (can be reassigned)',
		example: 'let volume = 0.8'
	},

	// Control flow
	'if': {
		signature: 'if <condition>',
		description: 'Executes a code block if the condition is true (uses indentation)',
		example: 'if beat % 4 == 0\n    trigger kick'
	},
	'else': {
		signature: 'else',
		description: 'Executes a code block if the previous condition was false (uses indentation)',
		example: 'if beat % 2 == 0\n    trigger kick\nelse\n    trigger snare'
	},
	'elseif': {
		signature: 'elseif <condition>',
		description: 'Alternative condition check. Aliases: elif, else_if',
		example: 'if x > 10\n    print "high"\nelseif x > 5\n    print "medium"\nelse\n    print "low"'
	},

	// Functions
	'function': {
		signature: 'function <name>(<params>)',
		description: 'Defines a reusable function (uses indentation). Alias: fn',
		example: 'function playKick()\n    drums.kick -> velocity(0.9)\n    sleep 250'
	},
	'fn': {
		signature: 'fn <name>(<params>)',
		description: 'Alias for "function" - defines a reusable function (uses indentation)',
		example: 'fn bassline()\n    synth -> chord(C2)\n    sleep 500'
	},

	// Synth and sound
	'synth': {
		signature: 'let <name> = { waveform: "...", ... }',
		description: 'Defines a synthesizer with its parameters as an object',
		example: 'let bass = {\n    waveform: "saw",\n    attack: 0.01,\n    release: 0.2\n}'
	},

	// Pattern and sequencing
	'pattern': {
		signature: 'pattern <name> with <bank>.<sample> = "..." OR pattern <name>',
		description: 'Defines a pattern - inline with string notation or block with indented code',
		example: 'pattern kick with drums.kick = "x---"\n\npattern melody\n    synth -> chord(C4)\n    sleep 250'
	},
	'loop': {
		signature: 'loop <times>',
		description: 'Repeats a code block a given number of times (uses indentation)',
		example: 'loop 4\n    synth -> chord(C4)\n    sleep 250'
	},
	'chord': {
		signature: '-> chord(<note>) or -> chord(<note1>, <note2>, ...)',
		description: 'Plays a note or chord. Supports note names (C4) or chord names (Cmaj)',
		example: 'synth -> chord(C4) -> duration(500)\nsynth -> chord(Cmaj) -> duration(1000)'
	},
	'trigger': {
		signature: 'trigger <pattern/sample>',
		description: 'Triggers a pattern or sample',
		example: 'trigger kick'
	},
	'sleep': {
		signature: 'sleep <milliseconds>',
		description: 'Pauses execution for the specified duration in milliseconds',
		example: 'sleep 1000'
	},

	// Effects (arrow syntax)
	'velocity': {
		signature: '-> velocity(<0.0-1.0>)',
		description: 'Sets the velocity (intensity) of a note (0.0 to 1.0)',
		example: 'synth -> chord(C4) -> velocity(0.8)'
	},
	'duration': {
		signature: '-> duration(<milliseconds>)',
		description: 'Sets the duration of a note in milliseconds',
		example: 'synth -> chord(C4) -> duration(500)'
	},
	'delay': {
		signature: '-> delay(<time>, <feedback>)',
		description: 'Applies a delay (echo) effect',
		example: 'synth -> chord(C4) -> delay(0.3, 0.5)'
	},
	'reverb': {
		signature: '-> reverb(<mix>, <size>)',
		description: 'Applies a reverb effect',
		example: 'synth -> chord(C4) -> reverb(0.4, 1.5)'
	},
	'distortion': {
		signature: '-> distortion(<amount>)',
		description: 'Applies distortion to the signal',
		example: 'synth -> chord(C2) -> distortion(0.6)'
	},
	'drive': {
		signature: '-> drive(<amount>)',
		description: 'Applies overdrive/saturation to the signal',
		example: 'synth -> chord(C2) -> drive(0.7)'
	},
	'chorus': {
		signature: '-> chorus(<rate>, <depth>)',
		description: 'Applies a chorus effect',
		example: 'synth -> chord(C4) -> chorus(0.5, 0.4)'
	},
	'lowpass': {
		signature: '-> lowpass(<frequency>, <resonance>)',
		description: 'Applies a lowpass filter',
		example: 'synth -> chord(C4) -> lowpass(800, 1.5)'
	},
	'highpass': {
		signature: '-> highpass(<frequency>, <resonance>)',
		description: 'Applies a highpass filter',
		example: 'synth -> chord(C4) -> highpass(500, 0.8)'
	},
	'bandpass': {
		signature: '-> bandpass(<frequency>, <resonance>)',
		description: 'Applies a bandpass filter',
		example: 'synth -> chord(C4) -> bandpass(1000, 2.0)'
	},

	// Automation and events
	'automate': {
		signature: 'automate <parameter>',
		description: 'Automates a parameter over time (uses indentation)',
		example: 'automate synth.volume\n    # automation code here'
	},
	'on': {
		signature: 'on <event>',
		description: 'Defines an event handler (uses indentation)',
		example: 'on beat\n    print "Beat tick"'
	},
	'emit': {
		signature: 'emit <event>',
		description: 'Triggers/emits a custom event',
		example: 'emit section_change'
	},

	// Groups and calls
	'group': {
		signature: 'group <name>',
		description: 'Groups multiple elements together (uses indentation)',
		example: 'group intro\n    synth -> chord(C4)\n    sleep 1000'
	},
	'call': {
		signature: 'call <group>',
		description: 'Calls/executes a group (synchronous)',
		example: 'call intro'
	},
	'spawn': {
		signature: 'spawn <group>',
		description: 'Spawns/executes a group in parallel (asynchronous)',
		example: 'spawn melody'
	},

	// Import/Export
	'import': {
		signature: '@import { <items> } from "<path>"',
		description: 'Imports items from another Devalang file',
		example: '@import { bassline, melody } from "lib/patterns.deva"'
	},
	'export': {
		signature: '@export { <items> }',
		description: 'Exports items to make them available to other files',
		example: '@export { intro, verse }'
	},
	'use': {
		signature: '@use "<path>"',
		description: 'Imports/uses an external file or module',
		example: '@use "lib/effects.deva"'
	},

	// ADSR parameters
	'attack': {
		signature: 'attack: <seconds>',
		description: 'Attack time of the ADSR envelope (time to reach peak amplitude)',
		example: 'let synth = { attack: 0.01 }'
	},
	'decay': {
		signature: 'decay: <seconds>',
		description: 'Decay time of the ADSR envelope (time to reach sustain level)',
		example: 'let synth = { decay: 0.1 }'
	},
	'sustain': {
		signature: 'sustain: <level>',
		description: 'Sustain level of the ADSR envelope (0.0 to 1.0)',
		example: 'let synth = { sustain: 0.7 }'
	},
	'release': {
		signature: 'release: <seconds>',
		description: 'Release time of the ADSR envelope (time to fade to silence)',
		example: 'let synth = { release: 0.2 }'
	},

	// Waveforms
	'waveform': {
		signature: 'waveform: "sine" | "square" | "saw" | "triangle"',
		description: 'Oscillator waveform type for synthesis',
		example: 'let synth = { waveform: "saw" }'
	},

	// Synth types (object properties)
	'pluck': {
		signature: 'type: "pluck"',
		description: 'Plucked string synthesis - sharp attack, quick decay',
		example: 'let synth = { type: "pluck", waveform: "triangle" }'
	},
	'pad': {
		signature: 'type: "pad"',
		description: 'Atmospheric pad sound - slow attack, long release',
		example: 'let synth = { type: "pad", waveform: "sine" }'
	},

	// Debug
	'print': {
		signature: 'print "<message>"',
		description: 'Prints a message to the console for debugging',
		example: 'print "Composition started"'
	},

	// Advanced keywords
	'routing': {
		signature: 'routing <name>',
		description: 'Defines audio routing configuration',
		example: 'routing master'
	},
	'bind': {
		signature: 'bind <source> to <target>',
		description: 'Binds a control or parameter to another',
		example: 'bind lfo to filter.cutoff'
	},
	'fx': {
		signature: 'fx <name>',
		description: 'Defines an effects pipeline. Alias: pipeline',
		example: 'fx masterChain'
	},
	'node': {
		signature: 'node <name>',
		description: 'Defines an audio processing node',
		example: 'node compressor'
	},
	'sidechain': {
		signature: 'sidechain <source> to <target>',
		description: 'Applies sidechain compression from source to target',
		example: 'sidechain kick to bass'
	}
};

/**
 * Creates a hover provider for Devalang
 */
export function createDevalangHoverProvider(): vscode.HoverProvider {
	return {
		provideHover(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken
		): vscode.ProviderResult<vscode.Hover> {
			// Get the word at the current position
			const wordRange = document.getWordRangeAtPosition(position);
			if (!wordRange) {
				return undefined;
			}

			const word = document.getText(wordRange);
			const docEntry = DEVALANG_DOCS[word.toLowerCase()];

			if (!docEntry) {
				return undefined;
			}

			// Build the markdown content
			const markdown = new vscode.MarkdownString();
			markdown.isTrusted = true;
			markdown.supportHtml = true;

			// Add signature
			markdown.appendCodeblock(docEntry.signature, 'deva');

			// Add description
			markdown.appendMarkdown(`\n${docEntry.description}\n\n`);

			// Add example
			if (docEntry.example) {
				markdown.appendMarkdown('**Example:**\n');
				markdown.appendCodeblock(docEntry.example, 'deva');
			}

			return new vscode.Hover(markdown, wordRange);
		}
	};
}
