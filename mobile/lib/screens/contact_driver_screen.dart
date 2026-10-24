import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class _Msg {
  final String text;
  final bool fromMe;
  const _Msg(this.text, this.fromMe);
}

class ContactDriverScreen extends StatefulWidget {
  const ContactDriverScreen({super.key, required this.trip});

  final Trip trip;

  @override
  State<ContactDriverScreen> createState() => _ContactDriverScreenState();
}

class _ContactDriverScreenState extends State<ContactDriverScreen> {
  final List<_Msg> _messages = [
    const _Msg("Hi! I'm on my way, about 6 minutes out.", false),
    const _Msg('Great, thank you! I\'ll be at the main entrance.', true),
    const _Msg('Perfect, see you soon 👍', false),
  ];
  final TextEditingController _input = TextEditingController();

  void _send() {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_Msg(text, true));
      _input.clear();
    });
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Contact driver'),
            RSheet(
              children: [
                RCard(
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: RColors.navy2,
                        child: const Text('M', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Marcus H.', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: RColors.navy)),
                            Text('★ 4.9 · ${widget.trip.car}', style: const TextStyle(fontSize: 12, color: RColors.muted)),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {},
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(color: RColors.ok, shape: BoxShape.circle),
                          alignment: Alignment.center,
                          child: const Icon(Icons.call, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
                const RSectionHeader(title: 'Message'),
                Container(
                  constraints: const BoxConstraints(minHeight: 180),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.md)),
                  child: Column(
                    children: [
                      for (final m in _messages)
                        Align(
                          alignment: m.fromMe ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            constraints: const BoxConstraints(maxWidth: 240),
                            decoration: BoxDecoration(
                              color: m.fromMe ? RColors.navy : RColors.surface,
                              borderRadius: BorderRadius.circular(RRadius.md),
                              border: m.fromMe ? null : Border.all(color: RColors.line),
                            ),
                            child: Text(
                              m.text,
                              style: TextStyle(fontSize: 13, color: m.fromMe ? Colors.white : RColors.navy),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(color: RColors.ground, borderRadius: BorderRadius.circular(RRadius.pill), border: Border.all(color: RColors.line)),
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        child: TextField(
                          controller: _input,
                          style: const TextStyle(fontSize: 13.5, color: RColors.navy),
                          decoration: const InputDecoration(border: InputBorder.none, isDense: true, hintText: 'Message your driver…', contentPadding: EdgeInsets.symmetric(vertical: 12)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _send,
                      child: Container(
                        width: 42,
                        height: 42,
                        decoration: const BoxDecoration(color: RColors.acc, shape: BoxShape.circle),
                        alignment: Alignment.center,
                        child: const Icon(Icons.send, size: 17, color: RColors.navy),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Center(
                  child: TextButton(
                    onPressed: () {},
                    child: const Text('Report an issue', style: TextStyle(color: RColors.bad, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
