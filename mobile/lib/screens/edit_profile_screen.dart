import 'package:flutter/material.dart';
import '../data/mock.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/hero_header.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late final TextEditingController _name = TextEditingController(text: rUser.name);
  late final TextEditingController _email = TextEditingController(text: rUser.email);
  late final TextEditingController _phone = TextEditingController(text: rUser.phone);

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    super.dispose();
  }

  void _save() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Profile updated.')),
    );
    Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            const HeroHeader(title: 'Edit profile'),
            RSheet(
              children: [
                Center(
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 44,
                        backgroundColor: RColors.navy2,
                        child: Text(
                          rUser.name.substring(0, 1),
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: const BoxDecoration(color: RColors.acc, shape: BoxShape.circle),
                          alignment: Alignment.center,
                          child: const Icon(Icons.edit, size: 15, color: RColors.navy),
                        ),
                      ),
                    ],
                  ),
                ),
                _InputField(label: 'Full name', controller: _name),
                _InputField(label: 'Email', controller: _email, keyboardType: TextInputType.emailAddress),
                _InputField(label: 'Phone', controller: _phone, keyboardType: TextInputType.phone),
                RButton(label: 'Save changes', variant: RButtonVariant.accent, onPressed: _save),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  const _InputField({required this.label, required this.controller, this.keyboardType});

  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: RColors.muted)),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
              color: RColors.ground,
              borderRadius: BorderRadius.circular(RRadius.md),
              border: Border.all(color: RColors.line),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: controller,
              keyboardType: keyboardType,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: RColors.navy),
              decoration: const InputDecoration(border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.symmetric(vertical: 12)),
            ),
          ),
        ],
      ),
    );
  }
}
